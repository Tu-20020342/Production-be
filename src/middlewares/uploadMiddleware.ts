import multer from 'multer';

const uploadFile = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

export { uploadFile };
