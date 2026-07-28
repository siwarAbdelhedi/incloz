// @desc    Create a new product
// @route   POST /api/products
// @access  Public (tu peux protéger plus tard avec un middleware)
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// GET all products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// GET single product
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

//Create a new product
const createProduct = asyncHandler(async (req, res) => {
    const { title, subtitle, description, price, image } = req.body
  
    if (!title || !description || !price || !image) {
      res.status(400)
      throw new Error('Please provide all required fields')
    }
  
    const product = new Product({
      title,
      subtitle,
      description,
      price,
      image,
    })
  
    const createdProduct = await product.save()
    res.status(201).json(createdProduct)
  })

export { getProducts, getProductById, createProduct };
