import { Request, Response, NextFunction } from 'express';
import validateChain from '../util/validateChain';
import { DB } from '../database';
import { ChainBase } from '../../shared/types';
import { factory, formatFilename } from '../../shared/logging';
const log = factory.getLogger(formatFilename(__filename));

const getSubstrateSpec = async (models: DB, req: Request, res: Response, next: NextFunction) => {
  const [chain, error] = await validateChain(models, req.query);
  if (error) return next(new Error(error));
  if (!chain) return next(new Error('Unknown chain.'));
  if (chain.base !== ChainBase.Substrate) return next(new Error('Chain must be substrate'));
  const spec = chain.substrate_spec;
  return res.json({ status: 'Success', result: spec || {} });
};

export default getSubstrateSpec;
