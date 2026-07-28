import express from 'express';
const router = express.Router();
import { getProducts, getProductById, createProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { createProductRules } from '../validators/productValidators.js';

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, createProductRules, validate, createProduct);

router.route('/:id').get(getProductById);

export default router;
