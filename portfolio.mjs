import express from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";
import pageRouter from "./routes/pageRoutes.js";
import tokenRouter from "./routes/tokenRoutes.js";
import contactData from "./routes/emailRoutes.js";
import { AppError } from "./utils/appError.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import "./server/cron.js";

const app = express();

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => {
  console.log("DB connection successful!");
});

// STATIC FOLDERS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// BODY PARSER MIDDLEWARE
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tokens", tokenRouter);
app.use("/api/v1/contact-data", contactData);

app.use("/", pageRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});
app.use(globalErrorHandler);

const port = 3005;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
