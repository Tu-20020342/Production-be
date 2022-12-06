import { validate } from 'class-validator';
import { Response } from 'express';
import { Account } from '../../models/accountModel';
import { Division } from '../../models/divisionModel';
import { JwtRequest } from '../../utils/types/customRequest';
import { IUser } from './dto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const checkCreateUserPayload = (
  username: string,
  password: string,
  name: string,
  divisionId: string,
  res: Response,
): Promise<boolean> => {
  const user = new IUser();
  user.username = username;
  user.password = password;
  user.name = name;
  user.divisionId = divisionId;
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

const checkUpdateUserPayload = (
  password: string,
  name: string,
  divisionId: string,
  res: Response,
): Promise<boolean> => {
  const user = new IUser();
  user.password = password;
  user.name = name;
  user.divisionId = divisionId;
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

const getUserDetail = async (req: JwtRequest, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await Account.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'divisionId',
          foreignField: '_id',
          as: 'divisionInfo',
        },
      },
      { $unwind: '$divisionInfo' },
    ]);
    return res.status(200).send(user);
  } catch (err) {
    return res.status(400).send({
      message: 'Can not find',
    });
  }
};

const getUserList = async (req: JwtRequest, res: Response) => {
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;
  const search = req.query.search
    ? {
        $text: { $search: String(req.query.search) },
      }
    : {};

  try {
    const results = await Account.aggregate([
      {
        $match: search,
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'divisionId',
          foreignField: '_id',
          as: 'divisionInfo',
        },
      },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $unwind: '$divisionInfo' }],
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
  } catch (err) {
    return res.status(400).send({
      message: 'Can not get user list',
    });
  }
};

const createUser = async (req: JwtRequest, res: Response) => {
  const { username, password, name, divisionId } = req.body;
  await checkCreateUserPayload(username, password, name, divisionId, res);

  try {
    const division = await Division.findById(divisionId);

    if (division) {
      const existAccount = await Account.findOne({ username: username });
      if (existAccount) {
        return res.status(400).send({
          message: 'Account existed',
        });
      }
      const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));
      const newAccount = await Account.create({
        username: username,
        password: hashedPassword,
        name: name,
        divisionId: new mongoose.Types.ObjectId(divisionId),
      });

      return res.status(200).send(newAccount);
    } else {
      return res.status(400).send({
        message: 'Not found division',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not create account',
    });
  }
};

const updateUser = async (req: JwtRequest, res: Response) => {
  const { password, name, divisionId } = req.body;
  await checkUpdateUserPayload(password, name, divisionId, res);
  const { userId } = req.params;
  try {
    const division = divisionId ? await Division.findById(divisionId) : true;

    if (division) {
      const hashedPassword = password
        ? await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS))
        : undefined;
      const newUser = await Account.findByIdAndUpdate(
        userId,
        {
          password: hashedPassword,
          name: name,
          divisionId: divisionId,
        },
        { new: true },
      );
      return res.status(200).send({
        newUser,
      });
    } else {
      return res.status(400).send({
        message: 'Not found division',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update user',
    });
  }
};

const getUserListByDivision = async (req: JwtRequest, res: Response) => {
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;
  const divisionId = String(req.params.divisionId);
  try {
    const results = await Account.aggregate([
      {
        $match: { divisionId: new mongoose.Types.ObjectId(divisionId) },
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'divisionId',
          foreignField: '_id',
          as: 'divisionInfo',
        },
      },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $unwind: '$divisionInfo' }],
        },
      },
      {
        $project: {
          count: '$stage1.count',
          data: '$stage2',
        },
      },
      { $unwind: '$count' },
    ]);
    return res.status(200).send({
      data: results[0]
        ? results[0]
        : {
            count: 0,
            data: [],
          },
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not get user list',
    });
  }
};

export { getUserDetail, getUserList, getUserListByDivision, createUser, updateUser };
