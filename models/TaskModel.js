import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    isCompleted: {type: Boolean, default: false},
    date: { type: Date, default: Date.now },
})

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, default: ""},
    priority: {type: String, enum: ["low", "medium", "high"], default: "low"},
    status: {type: String, enum: ["todo", "in-progress", "completed"], default: "todo"},
    dueDate: {type: Date},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    collaborators: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    subtasks: [subTaskSchema],
    isDeleted: {type: Boolean, default: false},
    deletedAt: {
        type: Date,
        default: null,
      },
}, {timestamps: true})

const Task = mongoose.model("Task", taskSchema);
export default Task;