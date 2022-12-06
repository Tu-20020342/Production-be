import express, { Router } from 'express';
import {
  createDivision,
  deleteDivision,
  getDivision,
  getListDivisions,
  updateDivision,
} from '../controllers/division/divisionController';
import { checkAdmin, verifyUser } from '../middlewares/authMiddleware';

export const divisionRouter: Router = express.Router();

divisionRouter.post('/', verifyUser, checkAdmin, createDivision);

divisionRouter.put('/:divisionId', verifyUser, checkAdmin, updateDivision);

divisionRouter.delete('/:divisionId', verifyUser, checkAdmin, deleteDivision);

divisionRouter.get('/:divisionId', verifyUser, checkAdmin, getDivision);

divisionRouter.get('/', verifyUser, getListDivisions);
