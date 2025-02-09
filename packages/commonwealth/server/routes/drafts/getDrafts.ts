import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { factory, formatFilename } from 'common-common/src/logging';
const log = factory.getLogger(formatFilename(__filename));

const getDiscussionDrafts = async (models, req: Request, res: Response, next: NextFunction) => {
  const addresses = await models.Address.findAll({
    where: {
      user_id: req.user.id,
    }
  });
  const addressIds = Array.from(addresses.map((address) => address.id));

  const drafts = await models.DiscussionDraft.findAll({
    where: {
      address_id: {
        [Op.in]: addressIds,
      }
    },
    include: [
      models.Address,
      models.Attachment
    ],
  });

  return res.json({ status: 'Success', result: drafts.map((d) => d.toJSON()) });
};

export default getDiscussionDrafts;
