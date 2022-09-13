import { Request, Response, NextFunction } from 'express';
import validateChain from '../util/validateChain';
import { DB } from '../database';
import { ChainBase } from 'common-common/src/types';
import { AppError, ServerError } from '../util/errors';

import testSubstrateSpec from '../util/testSubstrateSpec';
import {
  IRmqMsgUpdateChainCUD,
  RabbitMQController,
  RascalPublications
} from "common-common/src/rabbitmq";

const editSubstrateSpec = async (models: DB, rabbitMQController: RabbitMQController, req: Request, res: Response, next: NextFunction) => {
  const [chain, error] = await validateChain(models, req.body);
  if (error) return next(new AppError(error));
  if (!chain) return next(new AppError('Unknown chain.'));
  if (chain.base !== ChainBase.Substrate) return next(new AppError('Chain must be substrate'));

  const adminAddress = await models.Address.findOne({
    where: {
      address: req.body.address,
      user_id: req.user.id,
    },
  });
  const requesterIsAdmin = await models.Role.findAll({
    where: {
      address_id: adminAddress.id,
      chain_id: chain.id,
      permission: ['admin'],
    },
  });
  if (!requesterIsAdmin && !req.user.isAdmin) return next(new AppError('Must be admin to edit'));

  const node = await chain.getChainNode();
  if (!node) return next(new AppError('no chain nodes found'));

  let sanitizedSpec;
  try {
    sanitizedSpec = await testSubstrateSpec(req.body.spec, node.url);
  } catch (e) {
    return next(new AppError('Failed to validate Substrate Spec'));
  }

  // write back to database
  chain.substrate_spec = sanitizedSpec;

  const publishData: IRmqMsgUpdateChainCUD = {
    chain_id: chain.id,
    base: chain.base,
    network: chain.network,
    active: chain.active,
    chain_node_url: node.private_url || node.url,
    contract_address: chain.address,
    substrate_spec: sanitizedSpec || '',
    cud: 'update-chain'
  }

  await models.sequelize.transaction(async (t) => {
    await chain.save({ transaction: t });

    await rabbitMQController.publish(publishData, RascalPublications.ChainCUDChainEvents);
  });

  return res.json({ status: 'Success', result: chain.toJSON() });
};

export default editSubstrateSpec;
