import express, { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategoryDeatail,
  getListCategory,
  updateCategory,
} from '../controllers/category/cagtegoryController';
import { checkMalnufacturer, verifyUser } from '../middlewares/authMiddleware';

export const categoryRouter: Router = express.Router();

categoryRouter.get('/:categoryId', verifyUser, checkMalnufacturer, getCategoryDeatail);

categoryRouter.get('/', verifyUser, checkMalnufacturer, getListCategory);

categoryRouter.post('/', verifyUser, checkMalnufacturer, createCategory);

categoryRouter.put('/:categoryId', verifyUser, checkMalnufacturer, updateCategory);

categoryRouter.delete('/:categoryId', verifyUser, checkMalnufacturer, deleteCategory);
