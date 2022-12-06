import { JwtRequest } from '../../utils/types/customRequest';
import { Response } from 'express';
import { saveProductImage } from '../../utils/resizeImage';
import { File } from '../../models/fileModel';

const uploadImage = async (req: JwtRequest, res: Response) => {
  try {
    const fileName = await saveProductImage(req.file?.buffer);

    const savedFile = await File.create({
      fileName: fileName,
    });

    return res.status(200).send({
      fileName: savedFile.fileName,
      fileKey: savedFile.id,
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Can not upload file',
    });
  }
};

export { uploadImage };
