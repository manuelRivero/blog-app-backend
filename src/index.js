import express, { json } from "express";
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
import notificationRoutes from "./routes/notification/index.js";
import { errorHandler } from "./middleware/errorHandler/error-handler.js";
import cookieParser from "cookie-parser";
import admin from "firebase-admin";
import { keys } from "./firebase.js";

const app = express();

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "historial-medico-67d74",
    private_key_id: "182e2da997800effa09f135dc86029603f1cf17d",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuSsml3sdIRou9\nm6M+1dio6wnC5mCkx9HQUgQyHniDs+VzuWyXMEIwuF9eLQbLYKrKJSd4wx5KH8e5\n8qOi9kjINuV3eSrzfZEBhFoT6NKKpQQWW0DgWQPsHZ9/+Jmo5/rM++bGFIJpLBOd\nQaGdFixnZed/3n3CXyK/52jt11L7P+jMPx2VcGelxCJz3qHQX55yUPs1VG+keCE7\nsKhsABEC6+gi+1yoOF9YjhZPZe2HChHdi2SPf2PRPARDc569pq4qGfQ+8HKp8kUb\nkVcjh7GUeOZSToiEhJ21OeL3/Ui8ZYunbSl0wiEP2Wbfmqs0Fge0NAkPGRfqPY4f\nMa6c8S0lAgMBAAECggEAAQtVq0wVvusdSeTgKi+MfXFFvQiK/7HAIhK7ul57CQmk\n5aKbcfR0u7ypuvNjcl3Wkst83GO0OhbNUuHkn8SrVE0akYgE/THSvULrvz7KiXt0\n9iVUfYOgWw56YYE9z8iZX20K9EOJ3H4fx/YYCnboNokNGrOx5ojnY7r2jVDtoFpp\nIYPOjuzRUwRZUkWGIEkIr+FAzSoG5peIV0aR3kyRi5NsGHGn/k7JM3a5o/5rPxRa\nnSqf7swH4uT/aOKst7IkL3v9P+yaQUQ2f3RmvxISR3FAt4cI8a8tvCKYZjbRZUAR\nf9h3uYj8N5YCl0zGpFX3lctW3j8FZk/vKtEaeec8qQKBgQDpIaK30T5SwrZtmpwn\n/BajjopBEP83ayJ4jOAWB+0J6HhBZgj9cU+L6Odm9XSzxReFrbq5SVF8Viy0MH3/\nayQdJBoiGDdP7Qq7/PLM8ID2f0SBwn//dLP65GUi/WMmIiyq77fZ6MUJaqEGgMsU\nIGyB0J44H00Jl6BzEoa6BhiMowKBgQC/Y5azFr+cKov28XuWo7gMHS/mM9/Ta3hB\nlQMc6FpozVNEmQiwFH/26dTn0dzbxNDYj38cOLq3EU1EakQdjzvMYLldubnjXdlY\nqD85RFAsZ6fm4M+IKIJYgYMf8K5iA8DdS/CzgtVEeZvK3wGcb9elVphtPatBLMzR\n+c1RYSNzlwKBgQCxNE7x+AuubrCp+SaPQg+XPOab9KZ54mZuSW6fcGDd8iVOWJem\nxbVYPK1/1j1h1ANAKkDPTAqzPvF1+ZIcTr1BpUpz9gI9L4nEQM3xtzHfq/dPxp7y\ndyvDHk493Wq69qkLOXF/Im567OD/B3DVmJvBxOgu8qPlEar1LPTZe363jwKBgE81\nNSJLMOO9zA1YZZCzkzEYR0GbiG+kU7G4rQAivYAQMfz65NiSs18J6T5D4YbmzpRB\n1xZj+ApZ08OTwzsEk3gDM9QxUFhj99a0Uu4tcozeHWP0+I7eTQu6Ff17C4CvEvvD\nOQviAseDGNH+N1l6BCJ+Uzkqw5yGoQHpw2qBrD1jAoGACpiQer4JY+1x5N9SKwzq\nqR+EO/pFG/coKD1Rt08sKc3MYbMzgUH3Cpd5MaOEpwu76Vh71Uvjc9LNV57luNWQ\nfmGLTQqOifPn1mPCoC/2ANoPcu3E2P0WBIRx1t6n+1cak4X81KBf6V8J8Z4hh9H/\nBtNq9npy/urFQIF+gyRN93s=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-otbrv@historial-medico-67d74.iam.gserviceaccount.com",
    client_id: "117785466054293792623",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-otbrv%40historial-medico-67d74.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

console.log("admin", admin.app)
console.log("admin", admin.appCheck())

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
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

dbConnection();
const httpServer = http.createServer(app);
httpServer.listen(4000, () => {
  console.log("server running on port 4000");
});

console.log("index");
