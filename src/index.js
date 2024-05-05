import express, {json} from "express";
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
import categoryRoutes from "./routes/category/index.js";
import { errorHandler } from "./middleware/errorHandler/error-handler.js";
import cookieParser from "cookie-parser";
import admin from "firebase-admin"

const app = express();

dotenv.config();

const serviceKey = 
    {
      "type": process.env.TYPE,
      "project_id": process.env.PROJECT_ID,
      "private_key_id":process.env.PRIVATE_KEY_ID,
      "private_key":process.env.PRIVATE_KEY,
      "client_email":process.env.CLIENT_EMAIL,
      "client_id":process.env.CLIENT_ID,
      "auth_uri":process.env.AUTH_URI,
      "token_uri":process.env.TOKEN_URI,
      "auth_provider_x509_cert_url":process.env.AUTH_PROVIDER_X509_CERT_URL,
      "client_x509_cert_url":process.env.CLIENT_X509_CERT_URL,
      "universe_domain":process.env.UNIVERSE_DOMAIN 
    }    

admin.initializeApp({
  credential: admin.credential.cert(serviceKey)
});

const corsOptions = {
  //To allow requests from client
  origin: ["http://localhost:3000", "https://blog-point-nine.vercel.app"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
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
app.use("/api/blogs", blogsRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/category", categoryRoutes);

app.use(errorHandler);

dbConnection();
const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log("server running on port 4000");
});

console.log("index");


