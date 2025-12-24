import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import corsOptions from "./config/corsOptions.js";
import "./models/TaskModel.js";
import "./models/UserModel.js";

dotenv.config();

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// connect DB
connectDB();

// routes
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

export default app;
