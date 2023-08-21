import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import http from "http";
import { dbConnection } from "./db/index.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/index.js";
import userRoutes from "./routes/user/index.js";
import uploadRoutes from "./routes/uploads/index.js";
import blogsRoutes from "./routes/blogs/index.js";
import { errorHandler } from "./middleware/errorHandler/error-handler.js";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();
const corsOptions = {
  //To allow requests from client
  origin: ["http://localhost:3000", "http://127.0.0.1"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    preserveExtension: true,
    createParentPath: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blogs",blogsRoutes );
app.use("/api/uploads", uploadRoutes);

app.use(errorHandler);

dbConnection();
const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log("server running on port 4000");
});

console.log("index");
