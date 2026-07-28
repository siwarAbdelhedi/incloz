import express from "express";
const router = express.Router();

import { addToCart, getCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

// Ajouter un produit au panier
router.post("/", protect, addToCart);

// Récupérer le panier
router.get("/", protect, getCart);

export default router;
