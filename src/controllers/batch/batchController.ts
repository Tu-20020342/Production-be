import { JwtRequest } from '../../utils/types/customRequest';
import { Response } from 'express';
import { Batch } from '../../models/batchModel';
import { IBatch, IUpdateBatchPayload } from './dto';
import { validate } from 'class-validator';
import { Division } from '../../models/divisionModel';
import mongoose from 'mongoose';
import moment from 'moment';
import { DATE_TIME_FORMAT } from '../../utils/constant';
import { Product } from '../../models/productModel';

const checkCreateBatchPayload = (
  manufactureDate: string,
  batchSeri: string,
  note: string,
  warrantyPeriod: number,
  divisionId: string,
  res: Response,
): Promise<boolean> => {
  const batch = new IBatch();
  batch.manufactureDate = manufactureDate;
  batch.batchSeri = batchSeri;
  batch.note = note;
  batch.warrantyPeriod = warrantyPeriod;
  batch.divisionId = divisionId;

  return new Promise((resolve) => {
    if (!moment(manufactureDate, DATE_TIME_FORMAT, true).isValid()) {
      return res.status(400).send({
        message: `manufactureDate must be in '${DATE_TIME_FORMAT}' format`,
      });
    }

    validate(batch).then((errors) => {
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

const checkUpdateBatchPayload = (
  manufactureDate: string,
  batchSeri: string,
  note: string,
  warrantyPeriod: number,
  divisionId: string,
  res: Response,
): Promise<boolean> => {
  const batch = new IUpdateBatchPayload();
  batch.manufactureDate = manufactureDate;
  batch.batchSeri = batchSeri;
  batch.note = note;
  batch.warrantyPeriod = warrantyPeriod;
  batch.divisionId = divisionId;

  return new Promise((resolve) => {
    if (!moment(manufactureDate, DATE_TIME_FORMAT, true).isValid()) {
      return res.status(400).send({
        message: `manufactureDate must be in '${DATE_TIME_FORMAT}' format`,
      });
    }

    validate(batch, { skipMissingProperties: true }).then((errors) => {
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

const getBatchDetail = async (req: JwtRequest, res: Response) => {
  const { batchId } = req.params;

  try {
    const batch = await Batch.findById(batchId);
    return res.status(200).send({
      data: batch,
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not get batch detail',
    });
  }
};

const getListBatch = async (req: JwtRequest, res: Response) => {
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 10;
  const searchObj = req.query.search ? { $text: { $search: String(req.query.search) } } : {};

  try {
    const results = await Batch.aggregate([
      {
        $match: searchObj,
      },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],

          stage2: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
      {
        $project: {
          count: '$stage1.count',
          data: '$stage2',
        },
      },
    ]);
    return res.status(200).send({
      data: results[0],
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not get batch',
    });
  }
};

const createBatch = async (req: JwtRequest, res: Response) => {
  const { manufactureDate, batchSeri, note } = req.body;
  const divisionId = String(req.user?.divisionId);
  const warrantyPeriod = Number(req.body.warrantyPeriod);

  await checkCreateBatchPayload(manufactureDate, batchSeri, note, warrantyPeriod, divisionId, res);

  // find the division
  try {
    const division = await Division.findById(new mongoose.Types.ObjectId(divisionId));

    if (division) {
      const newBatch = await Batch.create({
        manufactureDate: manufactureDate,
        batchSeri: batchSeri,
        note: note,
        warrantyPeriod: warrantyPeriod,
        divisionId: divisionId,
      });

      return res.status(200).send({
        data: newBatch,
      });
    } else {
      return res.status(400).send({
        message: 'Can not find division of user',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not create batch',
    });
  }
};

const updateBatch = async (req: JwtRequest, res: Response) => {
  const { batchId } = req.params;
  const { manufactureDate, batchSeri, note } = req.body;
  const divisionId = String(req.user?.divisionId);
  const warrantyPeriod = Number(req.body.warrantyPeriod);

  await checkUpdateBatchPayload(manufactureDate, batchSeri, note, warrantyPeriod, divisionId, res);

  try {
    const division = await Division.findById(divisionId);
    if (division) {
      const newBatch = await Batch.findByIdAndUpdate(
        batchId,
        {
          manufactureDate: manufactureDate,
          batchSeri: batchSeri,
          note: note,
          warrantyPeriod: warrantyPeriod,
          divisionId: divisionId,
        },
        { new: true },
      );
      return res.status(200).send({
        data: newBatch,
      });
    } else {
      return res.status(400).send({
        message: 'Division not found',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update batch (not found division or batch)',
    });
  }
};

const deleteBatch = async (req: JwtRequest, res: Response) => {
  const { batchId } = req.params;

  try {
    await Batch.findByIdAndDelete(batchId);
    await Product.deleteMany({ batchId: batchId });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not delete batch',
    });
  }
};

export { getBatchDetail, getListBatch, createBatch, updateBatch, deleteBatch };
