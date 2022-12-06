import sharp from 'sharp';
import { v4 } from 'uuid';

const resizeProfileImage = (source: any) => {
  const fileName = v4() + '_' + v4() + Date.now().toString() + '.webp';
  sharp(source).resize(50, 50).toFile(`./files/profile-image/x50_${fileName}`);
  sharp(source).resize(200, 200).toFile(`./files/profile-image/x200_${fileName}`);
  sharp(source).resize(400, 400).toFile(`./files/profile-image/x400_${fileName}`);
  sharp(source).resize(800, 800).toFile(`./files/profile-image/x800_${fileName}`);
};

const saveProductImage = async (source: any) => {
  const fileName = v4() + '_' + v4() + Date.now().toString() + '.webp';
  await sharp(source).resize(200, 200).toFile(`./files/product-image/${fileName}`);
  return fileName;
};

const resizePostImage = (source: any) => {
  const fileName = v4() + '_' + v4() + Date.now().toString() + '.webp';
  sharp(source).resize(200, 200).toFile(`./files/post-image/x200_${fileName}`);
  sharp(source).resize(800, 800).toFile(`./files/post-image/x800_${fileName}`);
};

export { resizeProfileImage, resizePostImage, saveProductImage };
