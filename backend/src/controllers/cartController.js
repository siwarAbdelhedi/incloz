// controllers/cartController.js
import asyncHandler from "express-async-handler";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import { QUANTITE_MAX } from "../validators/cartValidators.js";

// @desc    Ajouter au panier
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, adaptation, quantity } = req.body;

  // Les règles de validation garantissent la forme de l'identifiant, pas
  // l'existence du produit : sans ce contrôle, un panier pouvait référencer
  // une ligne que le catalogue ne connaît pas.
  const produit = await Product.findById(productId);

  if (!produit) {
    res.status(404);
    throw new Error("Produit introuvable");
  }

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
    // Le plafond est appliqué ici aussi : chaque ajout est valide isolément,
    // mais leur cumul ne l'est pas nécessairement.
    existingProduct.quantity = Math.min(
      existingProduct.quantity + (quantity || 1),
      QUANTITE_MAX
    );
  } else {
    cart.products.push({ product: productId, size, adaptation, quantity: quantity || 1 });
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
