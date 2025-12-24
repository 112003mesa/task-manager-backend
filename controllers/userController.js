import User from "../models/UserModel.js";
import bcrypt from "bcrypt";

// --- Get all users ---
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("tasks");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const topUsers = async(req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const users = await User.find().select("-password -email -__v -updatedAt -tasks -title").sort({ createdAt: -1 }).limit(limit)
    
    res.status(200).json({success: true, users})
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- Add new user ---
const addUser = async (req, res) => {
  try {
    const { name, title, email, role, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      title,
      email,
      role,
      password: hashPassword,
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Update user ---
const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Delete user ---
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await Task.deleteMany({ owner: userId });

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User and their tasks deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export { getUsers, addUser, updateUser, deleteUser, topUsers };