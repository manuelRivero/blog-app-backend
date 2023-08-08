import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import http from "http";
import { dbConnection } from "./db/index.js";
import dotenv from "dotenv"
import authRoutes from "./routes/auth/index.js"
import userRoutes from "./routes/user/index.js"
import { errorHandler } from "./middleware/errorhandler/error-handler.js";

const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    preserveExtension: true,
    createParentPath: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);


dbConnection();
const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log("server running on port 4000");
});

console.log("index");
