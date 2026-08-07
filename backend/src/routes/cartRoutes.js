import express from "express";
const router = express.Router();

import { addToCart, getCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { addToCartRules } from "../validators/cartValidators.js";

// Ajouter un produit au panier
router.post("/", protect, addToCartRules, validate, addToCart);

// Récupérer le panier
router.get("/", protect, getCart);

export default router;
