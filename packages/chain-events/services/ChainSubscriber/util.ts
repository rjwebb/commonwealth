import _ from 'underscore';
import {
  createListener,
  ErcLoggingHandler,
  LoggingHandler,
  SubstrateEvents,
  SubstrateTypes,
  SupportedNetwork,
} from '../../src';
import { ChainBase, ChainNetwork } from 'common-common/src/types';
import { Pool } from 'pg';
import format from 'pg-format';
import { IListenerInstances } from './types';
import { ChainAttributes } from '../database/models/chain';
import { factory, formatFilename } from 'common-common/src/logging';
import { RabbitMqHandler } from '../ChainEventsConsumer/ChainEventHandlers/rabbitMQ';
import Rollbar from 'rollbar';

const log = factory.getLogger(formatFilename(__filename));

const generalLogger = new LoggingHandler();

export async function manageErcListeners(
  network: ChainNetwork,
  groupedTokens: { [url: string]: ChainAttributes[] },
  listenerInstances: IListenerInstances,
  producer: RabbitMqHandler,
  rollbar: Rollbar
) {
  // delete any listeners that have no more tokens to listen to
  const currentChainUrls = Object.keys(groupedTokens);
  for (const listenerName of Object.keys(listenerInstances)) {
    if (
      (listenerName.startsWith(ChainNetwork.ERC20) &&
        network === ChainNetwork.ERC20) ||
      (listenerName.startsWith(ChainNetwork.ERC721) &&
        network === ChainNetwork.ERC721)
    ) {
      const url = listenerName.slice(listenerName.indexOf('_') + 1);
      if (!currentChainUrls.includes(url)) {
        log.info(`Deleting listener: ${listenerName}`);
        await listenerInstances[listenerName].unsubscribe();
        delete listenerInstances[listenerName];
      }
    }
  }

  // create/update erc listeners
  for (const [url, tokens] of Object.entries(groupedTokens)) {
    const listenerName = `${network}_${url}`;
    const listener = listenerInstances[listenerName];
    const tokenAddresses = tokens.map((chain) => chain.contract_address);
    const tokenNames = tokens.map((chain) => chain.id);

    // if there is an existing listener for the given url and the tokens assigned
    // to it are different from the tokens given then delete the listener so that
    // we can create a new one with the updated token list
    if (
      listener &&
      !_.isEqual(tokenAddresses, listener.options.tokenAddresses)
    ) {
      log.info(`Deleting listener: ${listenerName}`);
      await listener.unsubscribe();
      delete listenerInstances[listenerName];
    }

    // if the listener does not exist then create a new one
    if (!listenerInstances[listenerName]) {
      let supportedNetwork: SupportedNetwork;
      switch (network) {
        case ChainNetwork.ERC20:
          supportedNetwork = SupportedNetwork.ERC20;
          break;
        case ChainNetwork.ERC721:
          supportedNetwork = SupportedNetwork.ERC721;
          break;
        default:
          break;
      }

      try {
        listenerInstances[listenerName] = await createListener(
          network,
          supportedNetwork,
          {
            url,
            tokenAddresses: tokenAddresses,
            tokenNames: tokenNames,
            verbose: false,
          }
        );
      } catch (e) {
        log.error(
          `An error occurred while starting a listener for ${JSON.stringify(
            tokenNames
          )} connecting to ${url}`,
          e
        );
        rollbar.critical(
          `An error occurred while starting a listener for ${JSON.stringify(
            tokenNames
          )} connecting to ${url}`,
          e
        );
      }
    }

    // get all the tokens who have verbose_logging set to true
    const tokenLog = tokens
      .filter((token) => token.verbose_logging)
      .map((token) => token.id);

    let logger = <ErcLoggingHandler>(
      (<unknown>listenerInstances[listenerName].eventHandlers['logger'])
    );
    // create the logger if this is a brand-new listener
    if (!logger && tokenLog.length > 0) {
      log.info(`Create a logger for listener: ${listenerName}`);
      if (network === ChainNetwork.ERC20)
        logger = new ErcLoggingHandler(ChainNetwork.ERC20, []);
      else if (network === ChainNetwork.ERC721)
        logger = new ErcLoggingHandler(ChainNetwork.ERC20, []);

      listenerInstances[listenerName].eventHandlers['logger'] = {
        handler: logger,
        excludedEvents: [],
      };
    } else if (logger && tokenLog.length === 0) {
      log.info(`Deleting logger on listener: ${listenerName}`);
      delete listenerInstances[listenerName].eventHandlers['logger'];
    } else if (logger && tokenLog.length > 0) {
      // update the tokens to log events for
      logger.tokenNames = tokenLog;
    }

    if (!listenerInstances[listenerName].eventHandlers['rabbitmq']) {
      log.info(`Adding RabbitMQ event handler to listener: ${listenerName}`);
      listenerInstances[listenerName].eventHandlers['rabbitmq'] = {
        handler: producer,
        excludedEvents: [],
      };
    }

    // subscribe the listener to its chain/RPC if it isn't yet subscribed
    if (!listenerInstances[listenerName].subscribed) {
      log.info(`Subscribing listener: ${listenerName}`);
      await listenerInstances[listenerName].subscribe();
    }
  }
}

/**
 * This function creates, updates, and deletes all listeners except ERC20 and
 * ERC721 listeners.
 * @param chains A list of new chains to create listener instances for
 * @param listenerInstances An object containing all the currently active listener instances
 * @param pool A PG pool instance used by the discoverReconnectRange function
 * @param producer An instance of RabbitMqHandler which is one of the event handlers
 * @param rollbar An instance of rollbar for error reporting
 */
export async function manageRegularListeners(
  chains: ChainAttributes[],
  listenerInstances: IListenerInstances,
  pool: Pool,
  producer: RabbitMqHandler,
  rollbar: Rollbar
) {
  // for ease of use create a new object containing all listener instances that are not ERC20 or ERC721
  const regListenerInstances: IListenerInstances = {};
  const activeListenerNames: string[] = [];
  for (const [name, instance] of Object.entries(listenerInstances)) {
    if (
      !name.startsWith(ChainNetwork.ERC20) &&
      !name.startsWith(ChainNetwork.ERC721)
    )
      regListenerInstances[name] = instance;
    activeListenerNames.push(name);
  }

  // delete any listeners that should no longer be active on this ChainSubscriber instance
  const updatedChainIds = chains.map((chain) => chain.id);
  Object.keys(regListenerInstances).forEach((name) => {
    if (!updatedChainIds.includes(name)) {
      log.info(`[${name}]: Deleting chain listener...`);
      listenerInstances[name].unsubscribe();
      delete listenerInstances[name];
    }
  });

  const newChains = chains.filter((chain) => {
    return !activeListenerNames.includes(chain.id);
  });

  // create listeners for all the new chains -- this does not update any existing chains!
  await setupNewListeners(
    newChains,
    listenerInstances,
    pool,
    producer,
    rollbar
  );

  // update existing listeners whose verbose_logging or substrate_spec has changed
  await updateExistingListeners(chains, listenerInstances, rollbar);

  // fetch and publish on-chain substrate identities
  // await fetchSubstrateIdentities(chains, listenerInstances, pool, producer, rollbar);
}

/**
 * Provided a list of the new chains that do not have existing listener instances,
 * this function will create a listener instance and setup all the relevant
 * event handlers.
 * @param newChains A list of new chains to create listener instances for
 * @param listenerInstances An object containing all the currently active listener instances
 * @param pool A PG pool instance used by the discoverReconnectRange function
 * @param producer An instance of RabbitMqHandler which is one of the event handlers
 * @param rollbar An instance of rollbar for error reporting
 */
async function setupNewListeners(
  newChains: ChainAttributes[],
  listenerInstances: IListenerInstances,
  pool: Pool,
  producer: RabbitMqHandler,
  rollbar: Rollbar
) {
  for (const chain of newChains) {
    let network: SupportedNetwork;
    if (chain.base === ChainBase.Substrate)
      network = SupportedNetwork.Substrate;
    else if (chain.network === ChainNetwork.Compound)
      network = SupportedNetwork.Compound;
    else if (chain.network === ChainNetwork.Aave)
      network = SupportedNetwork.Aave;
    else if (chain.network === ChainNetwork.Moloch)
      network = SupportedNetwork.Moloch;

    try {
      listenerInstances[chain.id] = await createListener(chain.id, network, {
        address: chain.contract_address,
        archival: false,
        url: chain.ChainNode.url,
        spec: chain.substrate_spec,
        skipCatchup: false,
        verbose: false, // using this will print event before chain is added to it
        enricherConfig: { balanceTransferThresholdPermill: 10_000 },
        discoverReconnectRange: discoverReconnectRange.bind({ pool }),
      });
    } catch (error) {
      delete listenerInstances[chain.id];
      log.error(`Unable to create a listener instance for ${chain.id}`, error);
      rollbar.critical(
        `Unable to create a listener instance for ${chain.id}`,
        error
      );
      continue;
    }

    // if a substrate chain then ignore some events
    let excludedEvents = [];
    if (network === SupportedNetwork.Substrate)
      excludedEvents = [
        SubstrateTypes.EventKind.Reward,
        SubstrateTypes.EventKind.TreasuryRewardMinting,
        SubstrateTypes.EventKind.TreasuryRewardMintingV2,
        SubstrateTypes.EventKind.HeartbeatReceived,
      ];

    // add the rabbitmq handler and the events it should ignore
    listenerInstances[chain.id].eventHandlers['rabbitmq'] = {
      handler: producer,
      excludedEvents,
    };

    // add the logger and the events it should ignore if required
    if (chain.verbose_logging) {
      listenerInstances[chain.id].eventHandlers['logger'] = {
        handler: generalLogger,
        excludedEvents,
      };
    }
  }
}

/**
 * Provided a list of all the chains, this function determines if any listeners
 * need to be updated. Values that could have changed in a chain instance
 * include verbose_logging and substrate_spec.
 * @param allChains An array containing all the chains pulled from the database
 * @param listenerInstances An object containing all the currently active listener instances
 * @param rollbar An instance of rollbar for error reporting
 */
async function updateExistingListeners(
  allChains: ChainAttributes[],
  listenerInstances: IListenerInstances,
  rollbar: Rollbar
) {
  for (const chain of allChains) {
    // if the chain is a substrate chain and its spec has changed since the last
    // check then update the active listener with the new spec
    if (
      chain.base === ChainBase.Substrate &&
      !_.isEqual(
        chain.substrate_spec,
        (<SubstrateEvents.Listener>listenerInstances[chain.id]).options.spec
      )
    ) {
      log.info(`Spec for ${chain.id} changed... restarting listener`);
      try {
        await (<SubstrateEvents.Listener>(
          listenerInstances[chain.id]
        )).updateSpec(chain.substrate_spec);
      } catch (error) {
        log.error(`Unable to update substrate spec for ${chain.id}!`, error);
        rollbar.critical(
          `Unable to update substrate spec for ${chain.id}!`,
          error
        );
      }
    }

    if (
      listenerInstances[chain.id].eventHandlers['logger'] &&
      !chain.verbose_logging
    ) {
      delete listenerInstances[chain.id].eventHandlers['logger'];
    }
  }
}

export function getListenerNames(
  listenerInstances: IListenerInstances
): string[] {
  const activeListenerInstances = [];
  for (const listenerName of Object.keys(listenerInstances)) {
    if (
      !listenerName.startsWith(ChainNetwork.ERC20) &&
      !listenerName.startsWith(ChainNetwork.ERC721)
    )
      activeListenerInstances.push(listenerName);
    else {
      activeListenerInstances.push(
        listenerInstances[listenerName].options.tokenNames
      );
    }
  }

  return activeListenerInstances;
}

/**
 * This function queries the chain-events database for the most recent
 * chain-event and attempts to retrieve all on-chain events since that
 * chain-event.
 * WARNING: This function requires to be binded with a PG pool instance
 * e.g. discoverReconnectRange.bind({ pool })
 * @param chain
 */
async function discoverReconnectRange(chain: string) {
  if (!this?.pool) {
    log.info(
      `[${chain}]: Cannot discover reconnect range because pg-pool is undefined!`
    );
    return;
  }

  let latestBlock;
  try {
    // eslint-disable-next-line max-len
    const eventTypes = (
      await this.pool.query(
        format('SELECT "id" FROM "ChainEventTypes" WHERE "chain"=%L', chain)
      )
    ).rows.map((obj) => obj.id);
    if (eventTypes.length === 0) {
      log.info(
        `[${chain}]: No events in database to get last block number from`
      );
      return { startBlock: null };
    }
    // eslint-disable-next-line max-len
    latestBlock = (
      await this.pool.query(
        format(
          'SELECT MAX("block_number") FROM "ChainEvents" WHERE "chain_event_type_id" IN (%L)',
          eventTypes
        )
      )
    ).rows;
  } catch (error) {
    log.warn(
      `[${chain}]: An error occurred while discovering offline time range`,
      error
    );
  }
  if (
    latestBlock &&
    latestBlock.length > 0 &&
    latestBlock[0] &&
    latestBlock[0].max
  ) {
    const lastEventBlockNumber = latestBlock[0].max;
    log.info(
      `[${chain}]: Discovered chain event in db at block ${lastEventBlockNumber}.`
    );
    return { startBlock: lastEventBlockNumber + 1 };
  } else {
    return { startBlock: null };
  }
}
