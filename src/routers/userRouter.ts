import express, { Router } from 'express';
import {
  createUser,
  getUserDetail,
  getUserList,
  getUserListByDivision,
  updateUser,
} from '../controllers/user/userController';
import { checkAdmin, verifyUser } from '../middlewares/authMiddleware';

export const userRouter: Router = express.Router();

// get details

userRouter.get('/:userId', verifyUser, checkAdmin, getUserDetail);

// get list

userRouter.get('/', verifyUser, checkAdmin, getUserList);

// create

userRouter.post('/', verifyUser, checkAdmin, createUser);

// update

userRouter.put('/:userId', verifyUser, checkAdmin, updateUser);

// delete

userRouter.delete('/:userId', verifyUser, checkAdmin);

// bonus

userRouter.get(
  '/get-user-list-by-division/:divisionId',
  verifyUser,
  checkAdmin,
  getUserListByDivision,
);
