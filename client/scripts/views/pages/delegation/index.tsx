/* @jsx m */

import m from 'mithril';
import numeral from 'numeral';
import _ from 'lodash';
import $ from 'jquery';

import 'pages/delegation/index.scss';

import { Account, AddressInfo, Profile } from 'models';
import app from 'state';
import { CWTextInput } from '../../components/component_kit/cw_text_input';
import {
  CWTable,
  TableEntry,
  TableEntryType,
} from '../../components/component_kit/cw_table';
import User from '../../components/widgets/user';
import ProfilesController from '../../../controllers/server/profiles';
import { chain } from 'lodash';
import { ChainNetwork } from 'types';
import AaveChain from '../../../controllers/chain/ethereum/aave/chain';
import DelegateCard from './delegate_card';
import Sublayout from '../../sublayout';
import CompoundChain from '../../../controllers/chain/ethereum/compound/chain';
import { ChainEntityInstance } from 'server/models/chain_entity';
import { ChainEventAttributes } from 'server/models/chain_event';
import { CompoundTypes, AaveTypes } from '@commonwealth/chain-events';
import { GovernanceStandard } from 'server/routes/getDelegationData';

type Proposal = {
  id: number,
  proposalText?: string;
  outcome?: boolean; // true if they voted with majority?
  proposalLink?: string; // url of the proposal on CW
}

type DelegationPageAttrs = { topic?: string };

export type DelegateInfo = {
  delegate: Account<any> | AddressInfo | Profile;
  delegateAddress: string;
  delegateName: string;
  voteWeight: number;
  totalVotes: number;
  proposals: number;
  rank: number;
  recentProposal: Proposal;
};

async function processDelegates(standard: GovernanceStandard): Promise<{
  delegate: DelegateInfo;
  delegates: DelegateInfo[];
}> {

  let response;
  try {
    response = await $.get(`${app.serverUrl()}/getDelegationData`, {
      delegation_standard: standard,
      chain: app.activeChainId(),
      jwt: app.user.jwt,
    });
  } catch (e) {
    console.log(e);
  }

  if (response.status !== 'Success') {
    throw new Error(`Cannot fetch events: ${response.status}`);
  }

  // Specifies number of votes per delegate
  let delegateWeighting: Map<string, number> = new Map();

  // Specifies which address each user is delegating votes to
  let delegateMap: Map<string, string> = new Map();
  
  // mapping from proposal index to proposal object
  let proposalMap: Map<number, Proposal>;

  // mapping from delegate address to indices of voted proposals,
  // most recent proposals, and vote direction
  let proposalVotes: Map<number, {Map, number}>

  let totalVotesCast = 0;

  response.result.map((rawEvent: ChainEventAttributes) => {
    const { chain_event_type_id, event_data } = rawEvent;
    // some simple string manipulation likely needs to be done here for the chain_event_type_id.
    const eventType = chain_event_type_id.slice(
      chain_event_type_id.indexOf('-') + 1,
      chain_event_type_id.length
    );
    const eventData = event_data;

    switch (standard) {
      /*
      case GovernanceStandard.ERC20Votes:
        switch (eventType) {
          case 'delegated-votes-changed':
            delegateWeighting[eventData.delegate] = eventData.newBalance;
            totalVotesCast += eventData.newBalance - eventData.oldBalance;
            break;
          case 'delegate-changed':
            delegateMap[eventData.delegator] = eventData.toDelegate;
            break;
          case 'proposal-created'
          default:
            break;
        }
        break;
      */
      case GovernanceStandard.Compound:
        switch (eventType) {
          case CompoundTypes.EventKind.ProposalCreated:
            let proposer : String = eventData.proposer;
            let id = eventData.id;
            let description = eventData.description;
            // TODO get CW link of proposal
            let newProposal: Proposal = {id: id, proposalText: description};
            proposalMap[id] = newProposal;
            break;
          case CompoundTypes.EventKind.ProposalQueued:
            proposalMap[eventData.id].outcome = true;
          case CompoundTypes.EventKind.ProposalCanceled:
            break;
          case CompoundTypes.EventKind.VoteCast:
            proposalVotes[eventData.voter][0][eventData.id] = eventData.support;
            proposalVotes[eventData.voter][1] = eventData.id;
            // TODO remove string once chain-events changes are merged
          case 'delegated-power-changed':
            delegateWeighting[eventData.user] = eventData.amount;
            totalVotesCast += eventData.newBalance - eventData.oldBalance;
            break;
          case 'delegate-changed':
            delegateMap[eventData.delegator] = eventData.toDelegate;
            break;
          default:
            break;
        }
        break;
      case GovernanceStandard.Aave:
        switch (eventType) {
          case AaveTypes.EventKind.ProposalCreated:
            let proposer : String = eventData.proposer;
            let id = eventData.id;
            // TODO description not contained in events
            // TODO get CW link of proposal
            let newProposal: Proposal = {id: id};
            proposalMap[id] = newProposal;
            break;
          case AaveTypes.EventKind.ProposalQueued:
            proposalMap[eventData.id].outcome = true;
            break;
          case AaveTypes.EventKind.DelegateChanged:
            // check if delegating voting power specifically
            if(eventData.type == 0) {
              delegateMap[eventData.delegator] = eventData.delegatee;
            }
            break;
          case AaveTypes.EventKind.DelegatedPowerChanged:
            if(eventData.type == 0) {
              delegateMap[eventData.delegator] = eventData.delegatee;
            }
            break;
          case AaveTypes.EventKind.VoteEmitted:
            proposalVotes[eventData.voter][0][eventData.id] = eventData.support;
            proposalVotes[eventData.voter][1] = eventData.id;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return rawEvent;
  });

  const prof: ProfilesController = new ProfilesController();

  // rank-order addresses by total votes:
  const rankOrderedMap = new Map(
    [...delegateWeighting.entries()].sort((a, b) => b[1] - a[1])
  );
  let allDelegates: DelegateInfo[] = [];
  let delegateOfUser: DelegateInfo = null;

  // Once this table is built (and rank-ordered), create DelegateInfo cards
  let rank = 1;
  for (let address of rankOrderedMap.keys()) {
    let delegateAddress = address;
    let delegate: Profile = prof.getProfile(chain.name, delegateAddress);
    let delegateName: string = delegate.name;
    let totalVotes = delegateWeighting[address];
    let voteWeight = parseFloat((totalVotes / totalVotesCast).toFixed(2));

    let proposals = proposalVotes[delegateAddress][0].size;
    let recentProposal = proposalVotes[delegateAddress][1];

    // push current delegate information
    var newDelegateInfo: DelegateInfo = {
      delegate,
      delegateAddress,
      delegateName,
      voteWeight,
      totalVotes,
      proposals,
      rank,
      recentProposal,
    };
    allDelegates.push(newDelegateInfo);

    // check to see if our user has delegated to this particular address.
    if (delegateMap[app.user.activeAccount.address] == address) {
      delegateOfUser = newDelegateInfo;
    }
    rank += 1;
  }
  console.log('delegate:', allDelegates);
  return { delegate: delegateOfUser, delegates: allDelegates };
}

function buildTableData(
  delegates: Array<DelegateInfo>,
  currentDelegate: DelegateInfo,
  keywordFragment: string,
  updateSelectedDelegate: (
    delegate: DelegateInfo | null,
    action: string
  ) => Promise<void>,
  standard: GovernanceStandard
): Array<Array<TableEntry>> {
  const result = [];

  for (const delegateInfo of delegates) {
    const {
      delegate,
      delegateAddress,
      delegateName,
      totalVotes,
      voteWeight,
      proposals,
      rank,
      recentProposal,
    } = delegateInfo;


    const isSelectedDelegate = _.isEqual(delegateInfo, currentDelegate);

    const currentRow = [
      {
        value: rank,
        type: TableEntryType.String,
      },
      {
        value: (
          <div class="delegate-avatar-section">
            {m(User, {
              user: delegate,
              avatarSize: 25,
              popover: true,
              avatarOnly: true,
            })}
            <div class="avatar-name">{delegateName}</div>
          </div>
        ),
        type: TableEntryType.Component,
      },
      {
        value: numeral(voteWeight).format('0.0%'),
        type: TableEntryType.String,
        align: 'right',
      },
      {
        value: numeral(totalVotes).format('0 a'),
        type: TableEntryType.String,
        align: 'right',
      },
      { value: proposals, type: TableEntryType.String, align: 'right' },
      {
        value: isSelectedDelegate ? 'Selected' : 'Delegate',
        type: TableEntryType.Button,
        buttonDetails: {
          onclick: () => {
            if (!isSelectedDelegate) {
              updateSelectedDelegate(delegateInfo, 'update');
              m.redraw();
            }
          },
          buttonType: isSelectedDelegate ? 'primary' : 'secondary',
        },
        align: 'right',
      },
    ];

    if (keywordFragment === '') {
      result.push(currentRow);
    } else {
      const keyLength = keywordFragment.length;
      const upperKeyword = keywordFragment.toUpperCase();
      if (
        delegateName.slice(0, keyLength).toUpperCase() === upperKeyword ||
        delegateAddress.slice(0, keyLength).toUpperCase() === upperKeyword
      ) {
        result.push(currentRow);
      }
    }
  }

  return result;
}

class DelegationPage implements m.ClassComponent<DelegationPageAttrs> {
  private delegate: DelegateInfo;
  private delegates: Array<DelegateInfo>;
  private filteredDelegateInfo: Array<Array<TableEntry>>;
  private tableRendered: boolean;
  private controller: AaveChain | CompoundChain;
  private standard: GovernanceStandard;

  async oninit() {
    // determine which governance standard being used by this community
    if (app.chain?.network === ChainNetwork.Aave) {
      this.standard = GovernanceStandard.Aave;
    } else if (app.chain?.network === ChainNetwork.Compound) {
      this.standard = GovernanceStandard.Compound;
    } else {
      this.standard = GovernanceStandard.ERC20Votes;
    }
    if (this.standard === GovernanceStandard.Aave) {
      this.controller = new AaveChain(app);
    } else {
      this.controller = new CompoundChain(app);
    }
    this.controller.init(app.chain.meta);
    // TODO: Replace below with processDelegates() call
  }
  view() {
    if (!this.delegate && !this.delegates) {
      processDelegates(this.standard).then(({ delegate, delegates }) => {
        this.delegate = delegate;
        this.delegates = delegates;
        this.tableRendered = false;
      });
    }
    const updateSelectedDelegate = async (
      delegate: DelegateInfo,
      action: string
    ) => {
      if (action === 'update') {
        this.delegate = delegate;
      } else if (action === 'remove') {
        this.delegate = null;
      }
      this.controller.setDelegate(delegate.delegateAddress);
      this.tableRendered = false;
      m.redraw();
    };

    // Handle Search Bar
    const updateFilter = (value: string) => {
      this.filteredDelegateInfo = buildTableData(
        this.delegates,
        this.delegate,
        value,
        updateSelectedDelegate,
        null
      );
      m.redraw();
    };

    if (this.tableRendered === false) {
      this.filteredDelegateInfo = buildTableData(
        this.delegates,
        this.delegate,
        '',
        updateSelectedDelegate,
        null
      );
      this.tableRendered = true;
    } 

    return (
      <Sublayout title="Delegation">
        {/* <div class="top-section">
          {this.delegate ? (
            <div class="wrapper">
              <div class="header">Delegates</div>
              <div class="subheader">Your Delegate</div>
              {
                // TODO: Include Info Icon when accessible
              }
              <DelegateCard
                delegateInfo={this.delegate}
                updateDelegate={updateSelectedDelegate}
              />
            </div>
          ) : (
            <div class="wrapper">
              <div class="delegate-missing-header">Choose a delegate</div>
              <div class="info-text">
                It's tough to keep up with DAO governance. Find a delegate that
                you trust and delegate your voting power to them. 👇👇👇
              </div>
            </div>
          )}
        </div>
        <div class="bottom-section">
          <div class="wrapper">
            <div class="subheader">Leaderboard</div>
            <div class="search-wrapper">
              <CWTextInput
                name="Form field"
                oninput={(e) => {
                  updateFilter((e.target as any).value);
                }}
                placeholder="Search Delegates"
              />
            </div>

            <CWTable
              columns={[
                { colTitle: 'Rank', colWidth: '7%', collapse: false },
                { colTitle: 'Delegate', colWidth: '25%', collapse: false },
                {
                  colTitle: 'Vote Weight',
                  colWidth: '15%',
                  align: 'right',
                  collapse: false,
                },
                {
                  colTitle: 'Total Votes',
                  colWidth: '15%',
                  align: 'right',
                  collapse: true,
                },
                {
                  colTitle: 'Proposals',
                  colWidth: '15%',
                  align: 'right',
                  collapse: true,
                },
                { colTitle: '', align: 'right', collapse: false },
              ]}
              data={this.filteredDelegateInfo}
            />
          </div>
        </div> */}
      </Sublayout>
    );
  }
}

export default DelegationPage;
