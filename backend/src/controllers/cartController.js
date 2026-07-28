// controllers/cartController.js
import asyncHandler from "express-async-handler";
import Cart from "../models/cartModel.js";

// @desc    Ajouter au panier
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, adaptation, quantity } = req.body;

  // Chercher ou créer un panier pour l'utilisateur connecté
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, products: [] });
  }

  const existingProduct = cart.products.find(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.adaptation === adaptation
  );

  if (existingProduct) {
    existingProduct.quantity += quantity || 1;
  } else {
    cart.products.push({ product: productId, size, adaptation, quantity });
  }

  await cart.save();
  res.status(201).json(cart);
});

// @desc    Récupérer panier
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
  if (!cart) {
    res.status(404);
    throw new Error("Panier introuvable");
  }
  res.json(cart);
});

export { addToCart, getCart };
