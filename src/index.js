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

admin.initializeApp({
  credential: admin.credential.cert(
    {
      "type": "service_account",
      "project_id": "blog-app-8a0bb",
      "private_key_id": "97bbb0c51dbaf4f85959461b1a5aa8b38493f9a9",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDTL/p6GzzuJ8zt\nzdlXuTGy4slYJCBdcOu6zC3lAdXoqxxhIeEoB+upEBiIDT0ODRhVwKN+iTXfCszB\n7wyKs6T9sZYdFRddlLEokJfUtRFU4TMPcNVxq3U4BjTeZhpqI0OEdh4Kfcruj4GP\ngG7ve7Ejkm798XxfhFG9WEYyQMR0LlvEQUauc9qWIx2voWWGBWKnAXpSxHeCxb6P\nKriQN5OA+QaYip4AOovmLzF8lmQzIhsI7flhM+UbZtsENscTNgGLZ/fGuiK0J4zw\nEpDCwiSLT/D2LYlARt9E0uj+3pcwYb+5DTjKd43+sYragTliSbcnTEPjdPjjzmo3\nRec1w129AgMBAAECggEAA+iIQd9kUP5ItpzLNuplDevi0OJ8jtmRkPe28t0qsI9X\n1IoR+PGu3fQbKUKOmmscMZxdDsxvRDiWqOy3Vmrvi5pim/RRZhiIXab2Pzpbw3fN\nLdKL5UN/V5E6aK2KfL84m8z08xVTvq3q7VU63OxQPOwBsmn80maRWUNtz/+zbC+M\ni/2TcKDIEg7W07Vm83YEcQhEEM7a7CmMq+/8Rgq+/ofvAZfndfR4Yc14wZ7s749v\nHDEvdSImtnTanTXxDfulo32khKo720VBvgmK3z5ruwX7J8vheC/nVHeOP+gG4C55\nsDv9GUppQq0Ha9U138JYhSZNVlS8pQGwZ6P63Rj4qQKBgQDzaofRWOiG0lAzEdut\nifLueV5Q2F9c0YKzL+3zRGn55yCNQbUFcMftltX+qf1WkJTnlrenCE8mfwS9oaKS\nDWn9KZQQmh/888nb9kBShmOF8mbuHKZ+5B6F2OUrIqdAfarUJMGw9TPq+7yJEAH+\np+my/MFS0g4tMAJgbedlmGaipwKBgQDeGutzqa9dDkp/dQRrJzpWOcpe3RpSM10K\nk2Jbc+7KeyKB0lSPLqu3s5u4DL1ryoRQpyi0wpKE81DSeJgSLnnmSlbi40q8FDKo\n+8gKU7ycuXnjqHXypTM+/VIuYnW2Dv/boRZ7M0OzjBe5D4jwtWIwS9bTJJ+jto+d\nb+oCQv98+wKBgQDp8eolF0ksQrfXzYMPr/SupDE0jDBjGe1+4ELWulsMVsnfWVZs\nqy9LtttnDeOxLfYe+qj5vS+tNQjOZKnFq2TBbxOiPS8fQwMwB+VcK1M9qnKoyRpv\n/DkltQbURVLv1Ze4mrcZpyDF6DoUlTEFmkYuw2PegIolfe3a1eY+q5GBIwKBgQC5\nJsXLCNR4hZZTBFCnpu75vHlYdYcgqVLRoyWmSVHyF44fnSACsIxTunWAi5ZIym1c\n8sx7S4xrKo7gtclHttjFwokF4SaG/Wtx9VrASSf9mpzizKdunIrI4tJkeo3YNE7U\nX0hnccfpYErSagHlb7+ntUEjiO9PwbudKhNwyTtEiwKBgQDPLhZESdxlvGI7bBlZ\nIxlAid314B3HMLHtdsmbDmP+3HMul8iP1Uz92kFqYeodWZq8XbEk6X/XihKusaWb\nUtu0AjZrTqKwG65jLUBlJa1dCwa48dn32V0Fc4JbwTrERc1mW8zT/rUjsTPW2GrE\nOUq0N7YW5wrnqo+1DBWSDaJlGA==\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-uaphh@blog-app-8a0bb.iam.gserviceaccount.com",
      "client_id": "110398620554411270428",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uaphh%40blog-app-8a0bb.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    }    
  )
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

// app.post("/send", (req, res)=>{
//   //const receivedToken = req.body.fcmToken;
//   const messaje = {
//       notification:{
//           title: "Notification",
//           body: "This is a Notification"
//       },
//       token:"dZF51EVjTjnpEr2wvBWlBI:APA91bFfJ9V0LbWQCdP8syAlzqq6wIVHZe_ynQuVbIEd4nA9N_7dNBqVRQiDTlEvLpk7dDCHy4S8GItb12pvvUPyP8KRbjcwgGBTTrGejNIlxTGWPurxev2o-h-y5B3xJMcxoxtWEmC6"
//   }
//   admin.messaging()
//   .send(messaje)
//   .then((response) => {
//       res.status(200).json({
//           messaje: "mensaje enviado 1",
//           //token: receivedToken
//       })
//       console.log("mensaje enviado 2", response)
//   })
//   .catch((error)=>{
//       res.status(400)
//       res.send(error)
//       console.log("error al enviar el mensaje", error)
//   })
  
// })

app.use(errorHandler);

dbConnection();
const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log("server running on port 4000");
});

console.log("index");


