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
  console.log("Visitor IP: ", clientIp);
  console.log("My IP: ", myIp);

  res.sendFile(path.join(__dirname, "..", "public", "html", "index.html"));

  if (clientIp !== myIp) {
    console.log("Client visiting");
    portfolioData.homepage_visits += 1;
  } else {
    console.log("Visit from own IP address");
    portfolioData.my_visits += 1;
  }

  fs.writeFileSync(
    "server/portfolio-data.json",
    JSON.stringify(portfolioData, null, 2)
  );

  console.log(`Homepage visits: ${portfolioData.homepage_visits}`);
  console.log(`Members: ${portfolioData.members.length}`);
};

export const coffeepots = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "coffeepots.html"));
};
