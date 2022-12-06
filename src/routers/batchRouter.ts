import express, { Router } from 'express';
import {
  createBatch,
  deleteBatch,
  getBatchDetail,
  getListBatch,
  updateBatch,
} from '../controllers/batch/batchController';
import { checkMalnufacturer, verifyUser } from '../middlewares/authMiddleware';

export const bathRouter: Router = express.Router();

bathRouter.get('/:batchId', verifyUser, checkMalnufacturer, getBatchDetail);

bathRouter.get('/', verifyUser, checkMalnufacturer, getListBatch);

bathRouter.post('/', verifyUser, checkMalnufacturer, createBatch);

bathRouter.put('/:batchId', verifyUser, checkMalnufacturer, updateBatch);

bathRouter.delete('/:batchId', verifyUser, checkMalnufacturer, deleteBatch);
