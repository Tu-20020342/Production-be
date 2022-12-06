import express, { Router } from 'express';
import {
  countProductSold,
  countProductWithDivisionAdmin,
  countProductWithPeriod,
  createProduct,
  getListProduct,
  getListProductByState,
  getListProductInDivision,
  getProductDetail,
  updateProduct,
  updateState10,
  updateState11,
  updateState12,
  updateState13,
  updateState2,
  updateState3,
  updateState4,
  updateState5,
  updateState6,
  updateState7,
  updateState8,
  updateState9,
} from '../controllers/product/productController';
import {
  checkAdmin,
  checkInsurancer,
  checkMalnufacturer,
  checkSeller,
  verifyUser,
} from '../middlewares/authMiddleware';

const productRouter: Router = express.Router();

productRouter.get('/count-product-sold', verifyUser, countProductSold);

productRouter.get('/count-product-with-period', verifyUser, countProductWithPeriod);

productRouter.get(
  '/count-product-with-division-admin',
  verifyUser,
  checkAdmin,
  countProductWithDivisionAdmin,
);

productRouter.get(
  '/product-list-in-division-admin',
  verifyUser,
  checkAdmin,
  getListProductInDivision,
);

productRouter.get('/product-list-by-state-admin', verifyUser, checkAdmin, getListProductByState);

productRouter.get('/:productId', verifyUser, getProductDetail);

productRouter.get('/', verifyUser, checkAdmin, getListProduct);

// get product list for every division

productRouter.post('/', verifyUser, checkMalnufacturer, createProduct);

productRouter.put('/:productId', verifyUser, checkMalnufacturer, updateProduct);
// update-state-2
productRouter.put('/update-state-2/:productId', verifyUser, checkMalnufacturer, updateState2);
// update-state-3
productRouter.put('/update-state-3/:productId', verifyUser, checkSeller, updateState3);
// update-state-4
productRouter.put('/update-state-4/:productId', verifyUser, checkSeller, updateState4);
// update-state-5
productRouter.put('/update-state-5/:productId', verifyUser, checkSeller, updateState5);
// update-state-6
productRouter.put('/update-state-6/:productId', verifyUser, checkSeller, updateState6);
// update-state-7
productRouter.put('/update-state-7/:productId', verifyUser, checkInsurancer, updateState7);
// update-state-8
productRouter.put('/update-state-8/:productId', verifyUser, checkInsurancer, updateState8);
// update-state-9
productRouter.put('/update-state-9/:productId', verifyUser, checkSeller, updateState9);
// update-state-10
productRouter.put('/update-state-10/:productId', verifyUser, checkInsurancer, updateState10);
// update-state-11
productRouter.put('/update-state-11/:productId', verifyUser, checkMalnufacturer, updateState11);
// update-state-12
productRouter.put('/update-state-12/:productId', verifyUser, checkSeller, updateState12);
// update-state-13
productRouter.put('/update-state-13/:productId', verifyUser, checkMalnufacturer, updateState13);

export { productRouter };
