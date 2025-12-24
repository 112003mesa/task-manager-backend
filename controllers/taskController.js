import Task from "../models/TaskModel.js";
import mongoose from "mongoose";

/* ================= CREATE TASK ================= */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      collaborators,
      subtasks,
    } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    // ✅ تحويل collaborators لـ ObjectId
    const collabs = (collaborators || [])
      .filter((c) => mongoose.Types.ObjectId.isValid(c))
      .map((c) => new mongoose.Types.ObjectId(c));

    const parsedSubtasks = (subtasks || []).map((s) => ({
      title: s.title || "",
      isCompleted: !!s.isCompleted,
    }));

    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || "low",
      status: status || "todo",
      dueDate: dueDate ? new Date(dueDate) : null,
      owner: req.user.id,
      collaborators: collabs,
      subtasks: parsedSubtasks,
    });

    await task.populate("owner", "name email role");
    await task.populate("collaborators", "name email role");

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET ALL TASKS ================= */
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isDeleted: false })
      .populate("owner", "name email role")
      .populate("collaborators", "name email role");

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= FILTERED TASKS ================= */
const getCompletedTasks = async (req, res) => {
  const tasks = await Task.find({
    owner: req.user.id,
    status: "completed",
    isDeleted: false,
  }).populate("owner collaborators", "name email role");

  res.json({ success: true, tasks });
};

const getInProgressTasks = async (req, res) => {
  const tasks = await Task.find({
    owner: req.user.id,
    status: "in-progress",
    isDeleted: false,
  }).populate("owner collaborators", "name email role");

  res.json({ success: true, tasks });
};

const getTodoTasks = async (req, res) => {
  const tasks = await Task.find({
    owner: req.user.id,
    status: "todo",
    isDeleted: false,
  }).populate("owner collaborators", "name email role");

  res.json({ success: true, tasks });
};

/* ================= LAST TEN ================= */
const getLastTenTasks = async (req, res) => {
  const tasks = await Task.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("owner collaborators", "name email role");

  res.json({ success: true, tasks });
};

/* ================= MY TASKS ================= */
const myTasks = async (req, res) => {
  const tasks = await Task.find({
    owner: req.user.id,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .populate("owner collaborators", "name email role");

  res.json({ success: true, tasks });
};

/* ================= UPDATE TASK ================= */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    if (task.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const {
      title,
      description,
      priority,
      status,
      dueDate,
      collaborators,
      subtasks,
    } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;

    if (Array.isArray(collaborators)) {
      task.collaborators = collaborators
        .filter((c) => mongoose.Types.ObjectId.isValid(c))
        .map((c) => new mongoose.Types.ObjectId(c));
    }

    task.subtasks = subtasks ?? task.subtasks;

    await task.save();

    res.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= SOFT DELETE ================= */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
  
    const isOwner = task.owner.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
  
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: "Forbidden" });
  
    task.isDeleted = true;
    task.deletedAt = new Date();
  
    await task.save();
  
    res.json({ success: true, message: "Task moved to trash" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= TRASH ================= */
const getTrashTasks = async (req, res) => {
  const tasks = await Task.find({
    owner: req.user.id,
    isDeleted: true,
  }).sort({ deletedAt: -1 });

  res.json({ success: true, tasks });
};

const restoreTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });
  
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
  
    task.isDeleted = false;
    task.deletedAt = null;
  
    await task.save();
  
    res.json({ success: true, message: "Task restored" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const restoreAllTasks = async (req, res) => {
  try {   
    await Task.updateMany(
      { owner: req.user.id, isDeleted: true },
      { isDeleted: false, deletedAt: null }
    );
  
    res.json({ success: true, message: "All tasks restored" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteForever = async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
      isDeleted: true,
    });
  
    res.json({ success: true, message: "Task permanently deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAllForever = async (req, res) => {
  console.log("DELETE ALL FOREVER START");
  console.log("REQ.USER:", req.user);
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const result = await Task.deleteMany({
      owner: userId,
      isDeleted: true,
    });

    return res.status(200).json({
      success: true,
      message: "Trash cleared",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export {
  createTask,
  getAllTasks,
  getCompletedTasks,
  getTodoTasks,
  getInProgressTasks,
  getLastTenTasks,
  myTasks,
  updateTask,
  deleteTask,
  getTrashTasks,
  restoreTask,
  restoreAllTasks,
  deleteForever,
  deleteAllForever,
};