import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const TOKEN_PATH = "./server/gelatoInstagramToken.json";

function isGelatoRequest(req) {
  const referer = req.get("referer") || req.get("referrer") || "";
  const origin = req.get("origin") || "";
  const haystack = `${referer} ${origin}`.toLowerCase();
  return haystack.includes("gelatopique.us");
}

export const getGelatoInstagramToken = (req, res) => {
  if (!isGelatoRequest(req)) {
    return res.status(403).json({
      status: "error",
      message: "Invalid or missing shop ID",
    });
  }
  try {
    const gelatoTokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    return res.status(200).json({
      status: "success",
      data: { accessToken: gelatoTokenData.instagramToken },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Token unavailable",
    });
  }
};
