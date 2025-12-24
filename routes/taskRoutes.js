import express from "express";
import {
  createTask,
  getAllTasks,
  getCompletedTasks,
  getInProgressTasks,
  getTodoTasks,
  getLastTenTasks,
  deleteTask,
  myTasks,
  updateTask,
  getTrashTasks,
  restoreTask,
  restoreAllTasks,
  deleteForever,
  deleteAllForever,
} from "../controllers/taskController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/* =======================
  GET ROUTES
======================= */
router.get("/all", getAllTasks);
router.get("/last-ten", getLastTenTasks);
router.get("/completed", verifyToken, getCompletedTasks);
router.get("/todo", verifyToken, getTodoTasks);
router.get("/in-progress", verifyToken, getInProgressTasks);

router.get("/my-tasks", verifyToken, myTasks);
router.get("/trash", verifyToken, getTrashTasks);

/* =======================
  POST ROUTES
======================= */
router.post("/create", verifyToken, createTask);

/* =======================
  PUT ROUTES
======================= */
router.put("/restore-all", verifyToken, restoreAllTasks);
router.put("/restore/:id", verifyToken, restoreTask);
router.put("/:id", verifyToken, updateTask);

/* =======================
  DELETE ROUTES
======================= */

// PERMANENT DELETE
router.delete("/clear-all", verifyToken, deleteAllForever);
router.delete("/delete-forever/:id", verifyToken, deleteForever);

// SOFT DELETE
router.delete("/:id", verifyToken, deleteTask);

export default router;
