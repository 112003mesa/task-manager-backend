import express from "express";
import {
  login,
  logout,
} from "../controllers/authController.js";
import { addUser, deleteUser, getUsers, topUsers, updateUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// =========================
router.post("/login", login);
router.post("/logout", logout);

// =========================
router.get("/all-users", getUsers);
router.get("/top-users", topUsers);
router.post("/add", verifyToken, isAdmin, addUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

// =========================
// لازم تمرر ID في URL
router.put("/:id", verifyToken, isAdmin, updateUser);

export default router;
