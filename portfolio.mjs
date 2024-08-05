import express, { json } from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";

dotenv.config({ path: "./config.env" });

const app = express();

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successful!");
  });

// STATIC FOLDERS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const members = JSON.parse(fs.readFileSync(`${__dirname}/members.json`));

// BODY PARSER MIDDLEWARE
console.log("NODE_ENV: ", process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");

// ROUTES
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A member must have a name"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "A member must have an email"],
    unique: true,
  },
  wishlist: [
    {
      title: { type: String },
      price: { type: Number },
      variant_id: { type: Number },
    },
  ],
});

const Member = mongoose.model("Member", memberSchema);
app.get("/api/v1/members", async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      members,
    },
  });
  console.log("Members route hit");
});
app.get("/", (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress;
  const myIp = "98.176.21.252";
  console.log(clientIp);

  res.sendFile(path.join(__dirname, "public/html/index.html"));

  if (clientIp !== myIp) {
    // Increment the homepage_visits
    portfolioData[0].homepage_visits += 1;

    // Write the updated data back to the file
    fs.writeFileSync(
      "public/portfolio-data.json",
      JSON.stringify(portfolioData, null, 2)
    );

    console.log(
      `Homepage visits updated to: ${portfolioData[0].homepage_visits}`
    );
  } else {
    // Increment the homepage_visits
    portfolioData[0].my_portfolio_visits += 1;

    // Write the updated data back to the file
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

app.get("/xtempo", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/xtempo.html"));
});

app.get("/socalwear", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/socalwear.html"));
});

app.get("/starlinker", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/starlinker.html"));
});

app.get("/coffeepots", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/coffeepots.html"));
});

app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "public/portfolio-data.json"));
  console.log(portfolioData);
});

// SERVER
app.listen(process.env.PORT, () => {
  console.log("App listening on port 3005");
});
