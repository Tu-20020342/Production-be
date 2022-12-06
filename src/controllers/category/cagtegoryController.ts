import { validate } from 'class-validator';
import { JwtRequest } from '../../utils/types/customRequest';
import { Response } from 'express';
import { ICategory } from './dto';
import { Category } from '../../models/categoryModel';
import { startSession } from 'mongoose';
import { Product } from '../../models/productModel';

const checkCreateCategoryPayload = (name: string, res: Response): Promise<boolean> => {
  const category = new ICategory();
  category.name = name;
  return new Promise((resolve) => {
    validate(category).then((errors) => {
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

const checkUpdateCategoryPayload = (name: string, res: Response): Promise<boolean> => {
  const category = new ICategory();
  category.name = name;
  return new Promise((resolve) => {
    validate(category, { skipMissingProperties: true }).then((errors) => {
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

const createCategory = async (req: JwtRequest, res: Response) => {
  const { name } = req.body;
  await checkCreateCategoryPayload(name, res);
  const category = await Category.create({
    name: name,
  });
  return res.status(200).send(category);
};

const updateCategory = async (req: JwtRequest, res: Response) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  await checkUpdateCategoryPayload(name, res);
  try {
    const category = await Category.findOneAndUpdate(
      { id: categoryId },
      {
        name: name,
      },
      { new: true },
    );
    return res.status(200).send(category);
  } catch (err) {
    return res.status(400).send({
      message: 'Can not update category',
    });
  }
};

const deleteCategory = async (req: JwtRequest, res: Response) => {
  const { categoryId } = req.params;

  try {
    await Category.findByIdAndDelete(categoryId, { new: true });

    await Product.deleteMany({ categoryId: categoryId }, { new: true });

    return res.status(200).send({
      message: 'Delete category success!',
    });
  } catch (err) {
    return res.status(400).send({
      message: err,
    });
  }
};

const getCategoryDeatail = async (req: JwtRequest, res: Response) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    return res.status(200).send(category);
  } catch (err) {
    return res.status(400).send({
      message: err,
    });
  }
};

const getListCategory = async (req: JwtRequest, res: Response) => {
  const { search } = req.query;
  const page = Number(req.query.page) ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5;
  const searchObj = search ? { $text: { $search: String(search) } } : {};

  const results = await Category.aggregate([
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
};

export { createCategory, updateCategory, deleteCategory, getCategoryDeatail, getListCategory };
