const express = require("express");
const { createUser, loginUser, getallUser, getaUser, deleteaUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutUser, updatePassword, forgotPasswordToken, resetPasword } = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");



const router = express.Router()

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/all-users", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/forgot-password-token", forgotPasswordToken)
router.put("/reset-password/:token", resetPasword)
router.put("/password", authMiddleware, updatePassword)
router.get("/logout", logoutUser);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/:id", deleteaUser);
router.put("/update", authMiddleware, updateUser);

router.put("/block/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock/:id", authMiddleware, isAdmin, unblockUser);


module.exports = router;
