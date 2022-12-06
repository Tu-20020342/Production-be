import { Product } from '../../models/productModel';
import { JwtRequest } from '../../utils/types/customRequest';
import { Response } from 'express';
import {
  IFile,
  IPeriodPayload,
  Iproduct,
  IProductState,
  IUpdateProduct,
  IUpdateState2Payload,
  IUpdateState4Payload,
  IUpdateState5PayLoad,
  IUpdateState6Payload,
  IUpdateStateParam,
} from './dto';
import { validate } from 'class-validator';
import { Category } from '../../models/categoryModel';
import { Batch } from '../../models/batchModel';
import { Division } from '../../models/divisionModel';
import mongoose from 'mongoose';
import moment from 'moment';

const checkCreateProductPayload = (
  categoryId: string,
  batchId: string,
  divisionId: string,
  note: string,
  productImage: IFile,
  res: Response,
): Promise<boolean> => {
  const product = new Iproduct();
  product.categoryId = categoryId;
  product.batchId = batchId;
  product.divisionId = divisionId;
  product.note = note;
  product.productImage = productImage;
  return new Promise((resolve) => {
    validate(product).then((errors) => {
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

const checkUpdateState2Payload = (sellerId: string, res: Response): Promise<boolean> => {
  const product = new IUpdateState2Payload();
  product.sellerId = sellerId;
  return new Promise((resolve) => {
    validate(product).then((errors) => {
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

const checkUpdateState4Payload = (customerName: string, customerAddress: string, res: any) => {
  const product = new IUpdateState4Payload();
  product.customerName = customerName;
  product.customerAddress = customerAddress;

  return new Promise((resolve) => {
    validate(product).then((errors) => {
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

const checkUpdateState5Payload = (defectiveDetail: string, res: any) => {
  const product = new IUpdateState5PayLoad();
  product.defectiveDetail = defectiveDetail;
  return new Promise((resolve) => {
    validate(product).then((errors) => {
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

const checkUpdateState6Payload = (insurrancerId: string, res: any) => {
  const product = new IUpdateState6Payload();
  product.insurrancerId = insurrancerId;
  return new Promise((resolve) => {
    validate(product).then((errors) => {
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

const checkUpdateStateParam = (productId: string, res: any) => {
  const param = new IUpdateStateParam();
  param.productId = productId;
  return new Promise((resolve) => {
    validate(param).then((errors) => {
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

const checkProductStateParam = (state: number, res: any) => {
  const stateObj = new IProductState();
  stateObj.state = state;
  return new Promise((resolve) => {
    validate(stateObj).then((errors) => {
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

const checkUpdateProductPayload = (
  categoryId: string,
  batchId: string,
  note: string,
  productImage: IFile,
  res: any,
) => {
  const product = new IUpdateProduct();
  product.categoryId = categoryId;
  product.batchId = batchId;
  product.note = note;
  product.productImage = productImage;
  return new Promise((resolve) => {
    validate(product).then((errors) => {
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

const checkPeriodPayload = (month: number, quater: number, year: number, res: any) => {
  const period = new IPeriodPayload();
  period.month = month;
  period.quater = quater;
  period.year = year;
  return new Promise((resolve) => {
    validate(period, { skipMissingProperties: true }).then((errors) => {
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

const getProductDetail = async (req: JwtRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const product = await Product.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(productId) },
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
        $lookup: {
          from: 'batches',
          localField: 'batchId',
          foreignField: '_id',
          as: 'batchInfo',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$divisionInfo' },
      { $unwind: '$batchInfo' },
      { $unwind: '$categoryInfo' },
    ]);

    return res.status(200).send({
      data: product[0],
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not find product',
    });
  }
};

const getListProduct = async (req: JwtRequest, res: Response) => {
  const { search } = req.query;
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;
  const searchObj = search ? { $text: { $search: String(search) } } : {};

  const results = await Product.aggregate([
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
  return res.status(200).send({ data: results[0] });
};

const createProduct = async (req: JwtRequest, res: Response) => {
  const { categoryId, batchId, note, productImage } = req.body;
  const divisionId = String(req.user?.divisionId);

  await checkCreateProductPayload(categoryId, batchId, divisionId, note, productImage, res);

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).send({
        message: 'Not found category',
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(400).send({
        message: 'Not found batch',
      });
    }

    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(400).send({
        message: 'Not found division',
      });
    }

    const newProduct = await Product.create({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      batchId: new mongoose.Types.ObjectId(batchId),
      divisionId: new mongoose.Types.ObjectId(divisionId),
      manufacturerId: new mongoose.Types.ObjectId(divisionId),
      note: note,
      state: 1,
      productImage: productImage,
      changeDate: Date.now(),
    });

    return res.status(200).send({
      data: newProduct,
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not create product',
    });
  }
};

const updateProduct = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);
  const { categoryId, batchId, note, productImage } = req.body;

  await checkUpdateStateParam(productId, res);
  await checkUpdateProductPayload(categoryId, batchId, note, productImage, res);

  try {
    const product = await Product.findById(productId);
    if (product && product.divisionId?.toString() === req.user?.divisionId && product.state === 1) {
      const result = await Product.findByIdAndUpdate(
        productId,
        {
          categoryId: categoryId,
          batchId: batchId,
          note: note,
          productImage: productImage,
        },
        {
          new: true,
        },
      );

      return res.status(200).send({
        data: result,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product',
    });
  }
};

// update sellerId to know where to send product forward
const updateState2 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);
  const { sellerId } = req.body;

  await checkUpdateStateParam(productId, res);
  await checkUpdateState2Payload(sellerId, res);

  try {
    const seller = await Division.findById(sellerId);
    if (!seller || seller.tier !== 3) {
      return res.status(400).send({
        message: 'Not found seller',
      });
    }

    const product = await Product.findById(productId);
    if (product && product.divisionId?.toString() === req.user?.divisionId && product.state === 1) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          sellerId: new mongoose.Types.ObjectId(sellerId),
          divisionId: new mongoose.Types.ObjectId(sellerId),
          state: 2,
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 2',
    });
  }
};

const updateState3 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (product && product.sellerId?.toString() === req.user?.divisionId && product.state === 2) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 3,
          divisionId: product.sellerId,
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 3',
    });
  }
};

const updateState4 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);
  const { customerName, customerAddress } = req.body;

  await checkUpdateStateParam(productId, res);
  await checkUpdateState4Payload(customerName, customerAddress, res);

  try {
    const product = await Product.findById(productId);
    if (product && product.sellerId?.toString() === req.user?.divisionId && product.state === 3) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 4,
          divisionId: product.sellerId,
          customerName: customerName,
          customerAddress: customerAddress,
          buyDate: Date.now(),
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 4',
    });
  }
};

const updateState5 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);
  const { defectiveDetail } = req.body;

  await checkUpdateStateParam(productId, res);
  await checkUpdateState5Payload(defectiveDetail, res);

  try {
    const product = await Product.findById(productId);
    if (product && product.sellerId?.toString() === req.user?.divisionId && product.state === 4) {
      const batch = await Batch.findById(product.batchId);
      if (!batch) {
        return res.status(400).send({
          message: 'Not found batch of product',
        });
      }

      if (
        moment()
          .startOf('day')
          .isSameOrAfter(
            moment(product.buyDate).add(batch.warrantyPeriod, 'months').utc().startOf('day'),
          )
      ) {
        return res.status(400).send({
          message: `The product warranty was expired in: ${moment(product.buyDate)
            .add(batch.warrantyPeriod, 'months')
            .utc()
            .startOf('day')}`,
        });
      }
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 5,
          defectiveDetail: defectiveDetail,
          isDefective: 2,
          insurranceTime: product.insurranceTime + 1,
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 5',
    });
  }
};

const updateState6 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);
  const { insurrancerId } = req.body;

  await checkUpdateStateParam(productId, res);
  await checkUpdateState6Payload(insurrancerId, res);

  try {
    const insurrancer = await Division.findById(insurrancerId);
    if (!insurrancer || insurrancer.tier !== 4) {
      return res.status(400).send({
        message: 'Not found insurrancer',
      });
    }

    const product = await Product.findById(productId);
    if (product && product.sellerId?.toString() === req.user?.divisionId && product.state === 5) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 6,
          insurrancerId: new mongoose.Types.ObjectId(insurrancerId),
          divisionId: new mongoose.Types.ObjectId(insurrancerId),
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 6',
    });
  }
};

const updateState7 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (
      product &&
      product.insurrancerId?.toString() === req.user?.divisionId &&
      product.state === 6
    ) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 7,
          divisionId: product.insurrancerId,
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 7',
    });
  }
};

const updateState8 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (
      product &&
      product.insurrancerId?.toString() === req.user?.divisionId &&
      product.state === 7
    ) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 8,
          divisionId: product.sellerId,
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 8',
    });
  }
};

const updateState9 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (product && product.sellerId?.toString() === req.user?.divisionId && product.state === 8) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 9,
          isDefective: 1,
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 9',
    });
  }
};

const updateState10 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (
      product &&
      product.insurrancerId?.toString() === req.user?.divisionId &&
      product.state === 7
    ) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 10,
          divisionId: product.manufacturerId,
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 10',
    });
  }
};

const updateState11 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (
      product &&
      product.manufacturerId?.toString() === req.user?.divisionId &&
      product.state === 10
    ) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 11,
          divisionId: product.manufacturerId,
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 10',
    });
  }
};

const updateState12 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (product && product.sellerId?.toString() === req.user?.divisionId && product.state === 3) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 12,
          division: product.manufacturerId,
          changeDate: Date.now(),
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 12',
    });
  }
};

const updateState13 = async (req: JwtRequest, res: Response) => {
  const productId = String(req.params.productId);

  await checkUpdateStateParam(productId, res);

  try {
    const product = await Product.findById(productId);
    if (
      product &&
      product.manufacturerId?.toString() === req.user?.divisionId &&
      product.state === 12
    ) {
      const newProduct = await Product.findByIdAndUpdate(
        productId,
        {
          state: 13,
          divisionId: product.manufacturerId,
        },
        { new: true },
      );
      return res.status(200).send({
        data: newProduct,
      });
    } else {
      return res.status(400).send({
        message: 'Not found product',
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update product to state 12',
    });
  }
};

const getListProductInDivision = async (req: JwtRequest, res: Response) => {
  const divisionId = String(req.user?.divisionId);
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;

  const results = await Product.aggregate([
    {
      $match: { divisionId: new mongoose.Types.ObjectId(divisionId) },
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
  return res.status(200).send({ data: results[0] });
};

const getListProductByState = async (req: JwtRequest, res: Response) => {
  const divisionId = String(req.user?.divisionId);
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;
  const state = Number(req.query.state);

  await checkProductStateParam(state, res);

  const results = await Product.aggregate([
    {
      $match: { divisionId: new mongoose.Types.ObjectId(divisionId), state: state },
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
  return res.status(200).send({ data: results[0] });
};

const countProductWithPeriod = async (req: JwtRequest, res: Response) => {
  const month = Number(req.query.month);
  const quater = Number(req.query.quater);
  const year = Number(req.query.year);
  let matchObj: any;
  let period: any;

  await checkPeriodPayload(month, quater, year, res);

  if (month && year) {
    matchObj = { month: month, year: year };
    period = { month: String(month), year: String(year) };
  } else if (quater && year) {
    switch (quater) {
      case 1:
        matchObj = { month: { $in: [1, 2, 3] }, year: year };
        period = { quater: '1', year: String(year) };
        break;
      case 2:
        matchObj = { month: { $in: [4, 5, 6] }, year: year };
        period = { quater: '2', year: String(year) };
        break;
      case 3:
        matchObj = { month: { $in: [7, 8, 9] }, year: year };
        period = { quater: '3', year: String(year) };
        break;
      case 4:
        matchObj = { month: { $in: [10, 11, 12] }, year: year };
        period = { quater: '4', year: String(year) };
        break;
      default:
        matchObj = { month: { $in: [1, 2, 3] }, year: year };
        period = { quater: '1', year: String(year) };
    }
  } else if (year) {
    matchObj = { year: year };
    period = { year: String(year) };
  } else {
    period = { allTime: 'true' };
  }

  try {
    const results = await Product.aggregate([
      {
        $addFields: {
          month: { $month: '$changeDate' },
          year: { $year: '$changeDate' },
        },
      },
      {
        $match: {
          divisionId: new mongoose.Types.ObjectId(req.user?.divisionId),
          ...matchObj,
        },
      },
      {
        $facet: {
          stage1: [{ $group: { _id: '$state', count: { $count: {} } } }],
        },
      },
      {
        $project: {
          data: '$stage1',
          period,
        },
      },
    ]);
    return res.status(200).send({ data: results[0] });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not find product',
    });
  }
};

const countProductWithDivisionAdmin = async (req: JwtRequest, res: Response) => {
  const divisionId = req.query.divisionId;
  const state = req.query.state;

  let matchObj: any;
  if (Number(state) && divisionId) {
    matchObj = {
      divisionId: new mongoose.Types.ObjectId(String(divisionId)),
      state: state,
    };
  } else if (divisionId) {
    matchObj = {
      divisionId: new mongoose.Types.ObjectId(String(divisionId)),
    };
  } else if (state) {
    matchObj = {
      state: state,
    };
  } else {
    matchObj = {};
  }

  try {
    const results = await Product.aggregate([
      {
        $match: { ...matchObj },
      },
      {
        $group: {
          _id: {
            divisionId: '$divisionId',
            state: '$state',
          },
          stateCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.divisionId',
          states: {
            $push: {
              state: '$_id.state',
              count: '$stateCount',
            },
          },
          count: { $sum: '$stateCount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 2 },
    ]);
    return res.status(200).send({ data: results });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not find product',
    });
  }
};

const countProductSold = async (req: JwtRequest, res: Response) => {
  const divisionId = req.query.divisionId;
  const month = Number(req.query.month);
  const quater = Number(req.query.quater);
  const year = Number(req.query.year);

  let matchObj: any;
  let period: any;

  await checkPeriodPayload(month, quater, year, res);

  if (month && year) {
    matchObj = { month: month, year: year };
    period = { month: String(month), year: String(year) };
  } else if (quater && year) {
    switch (quater) {
      case 1:
        matchObj = { month: { $in: [1, 2, 3] }, year: year };
        period = { quater: '1', year: String(year) };
        break;
      case 2:
        matchObj = { month: { $in: [4, 5, 6] }, year: year };
        period = { quater: '2', year: String(year) };
        break;
      case 3:
        matchObj = { month: { $in: [7, 8, 9] }, year: year };
        period = { quater: '3', year: String(year) };
        break;
      case 4:
        matchObj = { month: { $in: [10, 11, 12] }, year: year };
        period = { quater: '4', year: String(year) };
        break;
      default:
        matchObj = { month: { $in: [1, 2, 3] }, year: year };
        period = { quater: '1', year: String(year) };
    }
  } else if (year) {
    matchObj = { year: year };
    period = { year: String(year) };
  } else {
    period = { allTime: 'true' };
  }

  if (divisionId) {
    matchObj = { ...matchObj, divisionId: new mongoose.Types.ObjectId(String(divisionId)) };
  }

  try {
    const results = await Product.aggregate([
      {
        $addFields: {
          month: { $month: '$changeDate' },
          year: { $year: '$changeDate' },
        },
      },
      {
        $match: {
          ...matchObj,
          state: { $in: [4, 9] },
        },
      },
      {
        $facet: {
          stage1: [{ $group: { _id: '$divisionId', count: { $count: {} } } }],
        },
      },
      {
        $project: {
          data: '$stage1',
          period,
        },
      },
    ]);
    return res.status(200).send({ data: results[0] });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not find product',
    });
  }
};

export {
  getListProduct,
  getProductDetail,
  createProduct,
  updateProduct,
  updateState2,
  updateState3,
  updateState4,
  updateState5,
  updateState6,
  updateState7,
  updateState8,
  updateState9,
  updateState10,
  updateState11,
  updateState12,
  updateState13,
  getListProductInDivision,
  getListProductByState,
  countProductWithPeriod,
  countProductWithDivisionAdmin,
  countProductSold,
};
