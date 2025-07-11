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
import sgMail from "@sendgrid/mail";

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
app.options("/api/contact-data", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or your allowed domain
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Shopify-Shop-Domain"
  );
  res.status(200).end();
});

app.post("/api/contact-data", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or your domain
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Shopify-Shop-Domain"
  );

  const shopDomain = req.headers["x-shopify-shop-domain"];
  const {
    name,
    email,
    phone,
    wheel,
    frontDiameter,
    frontWidth,
    rearDiameter,
    rearWidth,
  } = req.body;

  res.status(200).end();

  if (shopDomain === "variantwheels.com") {
    console.log("Correct Shop Domain, Running SendMail!");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // sgMail.setDataResidency('eu');
    // uncomment the above line if you are sending mail using a regional EU subuser

    const msg = {
      to: "jose@josenaranjo.dev", // Change to your recipient
      from: "sales@variantwheels.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: `
        <h2><strong>New Hulk Form Submit</strong></h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Wheel:</strong> ${wheel}</p>
        <p><strong>Front Diameter:</strong> ${frontDiameter}</p>
        <p><strong>Front Width:</strong> ${frontWidth}</p>
        <p><strong>Rear Diameter:</strong> ${rearDiameter}</p>
        <p><strong>Rear Width:</strong> ${rearWidth}</p>
      `,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    console.log("Not an authorized Domain");
  }
});

const port = 3005;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
