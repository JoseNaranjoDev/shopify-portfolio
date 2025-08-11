import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const portfolioData = JSON.parse(fs.readFileSync("server/portfolio-data.json"));

export const homePage = (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress;
  const myIp = process.env.HOME_IP;
  res.sendFile(path.join(__dirname, "..", "public", "html", "index.html"));
  if (clientIp !== myIp) {
    portfolioData.homepage_visits += 1;
  } else {
    portfolioData.my_visits += 1;
  }
  fs.writeFileSync(
    "server/portfolio-data.json",
    JSON.stringify(portfolioData, null, 2)
  );
};

export const coffeepots = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "coffeepots.html"));
};
export const privacyPolicy = (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "public", "html", "privacy-policy.html")
  );
};
export const termsOfService = (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "public", "html", "terms-of-service.html")
  );
};
