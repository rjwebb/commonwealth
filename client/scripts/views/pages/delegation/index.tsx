/* @jsx m */

import m from 'mithril';
import numeral from 'numeral';
import _ from 'lodash';
import $ from 'jquery';

import 'pages/delegation/index.scss';

import { Account, AddressInfo, Profile } from 'models';
import app from 'state';
import { ChainNetwork } from 'types';
import { CompoundTypes } from '@commonwealth/chain-events';
import { decodeAddress } from '@polkadot/util-crypto';
import { PageNotFound } from 'views/pages/404';
import { ChainEventAttributes } from 'server/models/chain_event';
// import Web3 from 'web3';
import { ethers, providers } from 'ethers';
import { ERC20__factory } from '../../../../../shared/eth/types';
import { CWTextInput } from '../../components/component_kit/cw_text_input';
import {
  CWTable,
  TableEntry,
  TableEntryType,
} from '../../components/component_kit/cw_table';
import User from '../../components/widgets/user';
import ProfilesController from '../../../controllers/server/profiles';
import AaveChain from '../../../controllers/chain/ethereum/aave/chain';
import DelegateCard from './delegate_card';
import Sublayout from '../../sublayout';
import CompoundChain from '../../../controllers/chain/ethereum/compound/chain';
import Compound from '../../../controllers/chain/ethereum/compound/adapter';

const Web3 = require('web3');

export enum GovernanceStandard {
  ERC20Votes = 'ERC20Votes',
  CompoundGovernance = 'Compound',
  AaveGovernance = 'Aave',
}

type Proposal = {
  id: number;
  proposalText?: string;
  outcome?: boolean; // true if they voted with majority?
  proposalLink?: string; // url of the proposal on CW
};

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


async function getProposalData(address: string, standard: GovernanceStandard) : Promise<{
  proposals: number;
  mostRecentProposal: Proposal
}> {
  let response;
  try {
    response = await $.get(`${app.serverUrl()}/getDelegationData`, {
      delegation_standard: standard,
      chain: app.activeChainId(),
      jwt: app.user.jwt,
    });
    if (response.status !== 'Success') {
      throw new Error(`Cannot fetch events: ${response.status}`);
    }
  } catch (e) {
    console.log(e);
  }

  // mapping from proposal index to proposal object
  let proposalMap: Map<number, Proposal>;

  // mapping from indices of voted proposals to the delegate's support position
  // on said proposal
  let proposalVotes: Map<number, number>;
  let mostRecentProposal: number;

  response.result.map((rawEvent: ChainEventAttributes) => {
    const { chain_event_type_id, event_data } = rawEvent;
    const eventType = chain_event_type_id.slice(
      chain_event_type_id.indexOf('-') + 1,
      chain_event_type_id.length
    );
    const eventData = event_data;

    // assuming GovernanceStandard of Compound or ERC20Votes
    switch (eventType) {
      case CompoundTypes.EventKind.ProposalCreated: {
        const id = eventData.id;
        const proposalText = eventData.description;
        // TODO get CW link of proposal
        const newProposal: Proposal = { id, proposalText };
        proposalMap[id] = newProposal;
        break;
      }
      case CompoundTypes.EventKind.VoteCast: {
        if(eventData.voter === address) {
          proposalVotes[eventData.id] = eventData.support;
          mostRecentProposal = eventData.proposalId;
        }
        break;
      }
      default:
        break;
    }
    return rawEvent;
  });

  return { proposals: proposalVotes? proposalVotes.size : 0, mostRecentProposal: mostRecentProposal? proposalMap[mostRecentProposal] : null};
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
  const result: Array<Array<TableEntry>> = [];

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

    const currentRow: Array<TableEntry> = [
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
          disabled: false,
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

const initializeState = async () => {
  let standard: GovernanceStandard;
  if (app.chain?.network === ChainNetwork.Aave) {
    standard = GovernanceStandard.AaveGovernance;
  } else if (app.chain?.network === ChainNetwork.Compound) {
    standard = GovernanceStandard.CompoundGovernance;
  } else {
    standard = GovernanceStandard.ERC20Votes;
  }
  const controller = (app.chain as Compound).chain;
  let delegate;
  try {
    const delegateAddress = await controller.getDelegate();

    if (!delegateAddress) {
      delegate = null;
      console.log('No Delegate Address Found');
    } else {
      // most recently mined block and total token balance:
      const provider = controller.compoundApi.Provider;
      // const api = ERC20__factory.connect(app.chain.meta.address, new providers.Web3Provider(provider));
      // await api.deployed();
      const blockNumber : number = await controller.api.eth.getBlockNumber();
      const totalBalance = (await controller.compoundApi.Token.totalSupply()).toNumber();

      // compute voting power of delegate
      const totalVotes : number = (await controller.priorDelegates(delegateAddress, blockNumber)).toNumber();

      // compute weight of voting power as a fraction of all tokens
      const voteWeight : number = parseFloat((totalVotes / totalBalance).toPrecision(2));


      const {proposals: numProposals, mostRecentProposal: recentProposal} = await getProposalData(delegateAddress, standard);

      const delegateProfile = app.profiles.getProfile(
        app.chain?.id,
        delegateAddress
      );
      const delegateInfo: DelegateInfo = {
        delegate: delegateProfile,
        delegateAddress,
        delegateName: delegateProfile.displayName,
        voteWeight,
        totalVotes,
        proposals: numProposals,
        rank: 0,
        recentProposal,
      };
      delegate = delegateInfo;
    }
  } catch (e) {
    console.log(e);
  }

  return { delegate, controller };
};

class DelegationPage implements m.ClassComponent<DelegationPageAttrs> {
  private delegate: DelegateInfo;
  private delegates: Array<DelegateInfo>;
  private filteredDelegateInfo: Array<Array<TableEntry>>;
  private tableRendered: boolean;
  private controller: CompoundChain;
  private hasLoadedState: boolean;

  async oninit() {
    this.hasLoadedState = false;
    // determine which governance standard being used by this community
  }
  view() {
    if (app.chain?.loaded && app.chain.network !== ChainNetwork.Compound) {
      return m(PageNotFound, {
        title: 'Delegate Page',
        message: 'Delegate page unavailable on this chain.'
      });
    }
    if (!this.hasLoadedState && app.chain) {
      initializeState().then(({ delegate, controller }) => {
        this.delegate = delegate;
        this.controller = controller;
      });
      this.delegates = [];
      this.tableRendered = false;
      this.hasLoadedState = true;
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
      console.log("searching");
      const initialFilter = buildTableData(
        this.delegates,
        this.delegate,
        value,
        updateSelectedDelegate,
        null
      );

      if (initialFilter.length > 0) {
        this.filteredDelegateInfo = initialFilter;
        m.redraw();
      } else {
        try {
          decodeAddress(value); // Assert that its a valid address
          const delegateOptionProfile = app.profiles.getProfile(
            app.chain?.id,
            value
          );
          const delegateOption: DelegateInfo = {
            delegate: delegateOptionProfile,
            delegateAddress: value,
            delegateName: delegateOptionProfile.displayName,
            voteWeight: this.delegate.voteWeight,
            totalVotes: this.delegate.totalVotes,
            proposals: this.delegate.proposals,
            rank: 0,
            recentProposal: this.delegate.recentProposal,
          };

          this.filteredDelegateInfo = buildTableData(
            [delegateOption],
            this.delegate,
            '',
            updateSelectedDelegate,
            null
          );
          m.redraw();
        } catch (e) {
          // String is not an address and we don't match anything in the table
          this.filteredDelegateInfo = [];
        }
      }
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
        <div class="top-section">
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
            {/* <div class="subheader">Choose a Delegate</div> */}
            <div class="search-wrapper">
              <CWTextInput
                name="Form field"
                oninput={(e) => {
                  updateFilter((e.target as any).value);
                }}
                placeholder="Search for an Address"
              />
            </div>

            {this.filteredDelegateInfo?.length > 0 && (
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
            )}
          </div>
        </div>
      </Sublayout>
    );
  }
}

export default DelegationPage;