const express = require("express")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const { createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog } = require("../controllers/blogController")

const router = express.Router()

router.post("/create", authMiddleware, isAdmin, createBlog)
router.put("/like", authMiddleware, likeBlog)
router.put("/dislike", authMiddleware, dislikeBlog)
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get('/', getAllBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog)


module.exports = router