const express = require("express");
const { createProduct, getaProduct, getallProduct, updateProduct, deleteProduct, addToWishList, rating } = require("../controllers/productContoller");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct)
router.get("/:id", getaProduct)
router.get("/", getallProduct)
router.put("/wishlist", authMiddleware, addToWishList)
router.put("/rating", authMiddleware, rating)
router.put("/:id", authMiddleware, isAdmin, updateProduct)
router.delete("/:id", authMiddleware, isAdmin, deleteProduct)

module.exports = router;