import express, { json } from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
//import pagesRouter from "./routes/pageRoutes.js";
import userRouter from "./routes/userRoutes.js";
import "./server/cron.js";

const app = express();
const configData = JSON.parse(fs.readFileSync("./server/config.json", "utf8"));

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then((con) => {
  console.log("DB connection successful!");
});

// STATIC FOLDERS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const portfolioData = JSON.parse(fs.readFileSync("public/portfolio-data.json"));
const shopId = configData.shopId;

// BODY PARSER MIDDLEWARE
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");

//app.use("/", pagesRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress;
  const myIp = "98.176.21.252";
  console.log("Visitor IP: ", clientIp);

  res.sendFile(path.join(__dirname, "public/html/index.html"));

  if (clientIp !== myIp) {
    portfolioData[0].homepage_visits += 1;
    fs.writeFileSync(
      "public/portfolio-data.json",
      JSON.stringify(portfolioData, null, 2)
    );
    console.log(
      `Homepage visits updated to: ${portfolioData[0].homepage_visits}`
    );
  } else {
    portfolioData[0].my_portfolio_visits += 1;
    fs.writeFileSync(
      "public/portfolio-data.json",
      JSON.stringify(portfolioData, null, 2)
    );
    console.log("Visit from own IP address");
    console.log(
      `Homepage visits updated to: ${portfolioData[0].my_portfolio_visits}`
    );
  }
});

app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "public/portfolio-data.json"));
  console.log(portfolioData);
});
app.get("/signIn", (req, res) => {
  res.sendFile(path.join(__dirname, "public/portfolio-data.json"));
  console.log(req.rawHeaders);
});
app.get("/api/get-token", (req, res) => {
  const providedId = req.query.shopId;
  if (!providedId || providedId !== shopId) {
    return res.status(403).json({
      status: "error",
      message: "Invalid or missing shop ID",
    });
  }
  res.status(200).json({
    status: "success",
    data: { accessToken: LONG_LIVED_TOKEN },
  });
});

export default app;
