import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const gelatoTokenData = JSON.parse(
  fs.readFileSync("./server/gelatoInstagramToken.json", "utf8")
);
export const getGelatoInstagramToken = (req, res) => {
  const referer = req.get("referer") || req.get("referrer");
  if (
    !referer.includes("https://gelatopique.us/") ||
    !referer.includes("gelatopique.us")
  ) {
    return res.status(403).json({
      status: "error",
      message: "Invalid or missing shop ID",
    });
  }
  res.status(200).json({
    status: "success",
    data: { accessToken: gelatoTokenData.instagramToken },
  });
};
