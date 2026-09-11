import { recordPageVisit } from "../models/userModel.js";

const STATIC_PREFIXES = [
  "/css/",
  "/js/",
  "/img/",
  "/fonts/",
  "/video/",
  "/api/",
  "/favicon",
];

const STATIC_EXT =
  /\.(css|js|mjs|map|png|jpe?g|gif|webp|ico|svg|woff2?|ttf|otf|mp4|webm|json|xml|txt|webmanifest|sfk)$/i;

export function trackPageVisits(req, res, next) {
  if (req.method !== "GET") {
    return next();
  }

  const pathValue = req.path || "/";
  if (STATIC_PREFIXES.some((prefix) => pathValue.startsWith(prefix))) {
    return next();
  }
  if (STATIC_EXT.test(pathValue)) {
    return next();
  }

  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 400) {
      return;
    }
    try {
      recordPageVisit(pathValue);
    } catch (err) {
      // analytics must never break page responses
    }
  });

  next();
}
