import { validate } from 'class-validator';
import { JwtRequest } from '../../utils/types/customRequest';
import { IDivision } from './dto';
import { Response } from 'express';
import { Division } from '../../models/divisionModel';
import { Account } from '../../models/accountModel';
import { Product } from '../../models/productModel';

const checkCreateDivisionPayload = (
  tier: number | undefined,
  tierName: string | undefined,
  address: string | undefined,
  res: Response,
): Promise<boolean> => {
  const user = new IDivision();
  user.tier = tier;
  user.tierName = tierName;
  user.address = address;
  return new Promise((resolve) => {
    validate(user).then((errors) => {
      if (errors.length) {
        const constraint = { ...errors[0].constraints };
        return res.status(400).send({
          message: Object.values(constraint)[0],
        });
      } else {
        resolve(true);
      }
    });
  });
};

const checkUpdateDivisionPayload = (
  tier: number | undefined,
  tierName: string | undefined,
  address: string | undefined,
  res: Response,
): Promise<boolean> => {
  const user = new IDivision();
  user.tier = tier;
  user.tierName = tierName;
  user.address = address;
  return new Promise((resolve) => {
    validate(user, { skipMissingProperties: true }).then((errors) => {
      if (errors.length) {
        const constraint = { ...errors[0].constraints };
        return res.status(400).send({
          message: Object.values(constraint)[0],
        });
      } else {
        resolve(true);
      }
    });
  });
};

const createDivision = async (req: JwtRequest, res: Response) => {
  const { tierName, address }: IDivision = req.body;
  const tier = Number(req.body.tier);
  await checkCreateDivisionPayload(tier, tierName, address, res);
  const division = await Division.create({
    tier: tier,
    tierName: tierName,
    address: address,
  });
  return res.status(200).send(division);
};

const updateDivision = async (req: JwtRequest, res: Response) => {
  const { tierName, address } = req.body as IDivision;
  const { divisionId } = req.params;
  const tier = Number(req.body.tier);

  await checkUpdateDivisionPayload(tier, tierName, address, res);
  try {
    const division = await Division.findOneAndUpdate(
      { id: divisionId },
      {
        tier: tier,
        tierName: tierName,
        address: address,
      },
      { new: true },
    );
    return res.status(200).send(division);
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update division',
    });
  }
};

const deleteDivision = async (req: JwtRequest, res: Response) => {
  const { divisionId } = req.params;
  try {
    await Division.findByIdAndDelete(divisionId);
    await Account.deleteMany({ divisionId: divisionId });
    await Product.deleteMany({
      $or: [
        { divisionId: divisionId },
        { manufacturerId: divisionId },
        { sellerId: divisionId },
        { insurrancerId: divisionId },
      ],
    });
    return res.status(200).send({
      message: 'Delete division success!',
    });
  } catch (err) {
    return res.status(400).send({
      message: err,
    });
  }
};

const getDivision = async (req: JwtRequest, res: Response) => {
  const { divisionId } = req.params;
  try {
    const division = await Division.findById(divisionId);
    if (division) {
      return res.status(200).send({ data: division });
    } else {
      return res.status(400).send({
        message: 'Division not found',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not find division',
    });
  }
};

const getListDivisions = async (req: JwtRequest, res: Response) => {
  const { search } = req.query;
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;
  const searchObj = search ? { $text: { $search: String(search) } } : {};

  const results = await Division.aggregate([
    {
      $match: searchObj,
    },
    {
      $facet: {
        stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],

        stage2: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      },
    },
    { $unwind: '$stage1' },
    {
      $project: {
        count: '$stage1.count',
        data: '$stage2',
      },
    },
  ]);
  return res.status(200).send(...results);
};

export { createDivision, updateDivision, deleteDivision, getDivision, getListDivisions };
