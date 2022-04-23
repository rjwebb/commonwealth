import { Op } from 'sequelize';
import validateChain from '../util/validateChain';
import { DB } from '../database';
import { AppError, ServerError } from '../util/errors';
import { ChainEventAttributes } from '../models/chain_event';
import {
  TypedRequestQuery,
  TypedResponse,
  success,
  TypedRequestBody,
} from '../types';
import { NextFunction } from 'express';
import { CompoundTypes, AaveTypes } from '@commonwealth/chain-events';

export const Errors = {
  InvalidEvent: 'Invalid event',
};

// TODO: get this to export to client correctly, if possible. Else refactor to avoid use
export enum GovernanceStandard {
  ERC20Votes = 'ERC20Votes',
  Compound = 'Compound',
  Aave = 'Aave',
}

type getDelegationDataReq = {
  delegation_standard: GovernanceStandard;
  chain: string;
};
type getDelegationDataResp = ChainEventAttributes[];

const getDelegationData = async (
  models: DB,
  req: TypedRequestQuery<getDelegationDataReq>,
  res: TypedResponse<getDelegationDataResp>,
  next: NextFunction
) => {
  // TODO: runtime validation based on params
  //   maybe something like https://www.npmjs.com/package/runtime-typescript-checker
  const [chain, error] = await validateChain(models, {
    chain: req.query.chain,
  });
  if (error) {
    console.log('It throws an AppError', error);
    return next(new Error(error));
  }

  try {
    // determine which set of events to query:
    let chainEventIds: string[] = [];
    switch (req.query.delegation_standard) {
      case GovernanceStandard.ERC20Votes:
        chainEventIds = ['delegate-changed', 'delegate-votes-changed'];
        break;
      case GovernanceStandard.Compound:
        chainEventIds = [
          'proposal-executed',
          'proposal-created',
          'proposal-canceled',
          'proposal-queued',
          'vote-cast',
          'delegate-changed',
          'delegate-votes-changed'
        ];
        break;
      case GovernanceStandard.Aave:
        // TODO how many of these are actually necessary? 
        chainEventIds = [
          AaveTypes.EventKind.ProposalCreated,
          AaveTypes.EventKind.DelegateChanged,
          AaveTypes.EventKind.DelegatedPowerChanged,
          AaveTypes.EventKind.ProposalQueued,
          AaveTypes.EventKind.ProposalCanceled
        ];
        break;
      default:
        break;
    }

    const delegationEvents = await models.ChainEvent.findAll({
      where: {
        chain_event_type_id: {
          [Op.in]: chainEventIds.map((val) => `${chain.id}-` + val),
        },
      },
    });

    return success(
      res,
      delegationEvents.map((v) => v.toJSON())
    );
  } catch (err) {
    throw new ServerError(err);
  }
};

export default getDelegationData;
