import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import corsOptions from "./config/corsOptions.js";
import "./models/TaskModel.js";
import "./models/UserModel.js";

dotenv.config();
const PORT = process.env.PORT || 5000

const app = express();
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser());

connectDB();

app.use("/api/user", userRoutes)
app.use("/api/task", taskRoutes)


app.get("/", (req, res) => {
    res.send("API Running...");
  });

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})