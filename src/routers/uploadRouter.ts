import express, { Router } from 'express';
import { uploadImage } from '../controllers/upload/uploadController';
import { uploadFile } from '../middlewares/uploadMiddleware';

export const uploadRouter: Router = express.Router();

uploadRouter.post('/', uploadFile.single('image'), uploadImage);

uploadRouter.delete('/:urlKey');
