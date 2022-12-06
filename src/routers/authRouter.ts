import express, { Router } from 'express';
import { signIn } from '../controllers/auth/authController';

const authRouter: Router = express.Router();

authRouter.post('/sign-in', signIn);

export { authRouter };
