import express, { json } from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";
import pageRouter from "./routes/pageRoutes.js";
import tokenRouter from "./routes/tokenRoutes.js";
import { AppError } from "./utils/appError.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import "./server/cron.js";
import sgMail from "@sendgrid/mail";

const app = express();
const gelatoTokenData = JSON.parse(
  fs.readFileSync("./server/gelatoInstagramToken.json", "utf8")
);

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

const gelatoShopId = process.env.GELATO_SHOP_ID;

// BODY PARSER MIDDLEWARE
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tokens", tokenRouter);

app.get("/signIn", (req, res) => {
  res.sendFile(path.join(__dirname, "server/portfolio-data.json"));
  console.log(req.rawHeaders);
});
app.get("/api/get-token", (req, res) => {
  const providedId = req.query.shopId;
  if (!providedId || providedId !== gelatoShopId) {
    return res.status(403).json({
      status: "error",
      message: "Invalid or missing shop ID",
    });
  }
  res.status(200).json({
    status: "success",
    data: { accessToken: gelatoTokenData.instagramToken },
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
    frontOffset,
    rearDiameter,
    rearWidth,
    rearOffset,
    centerFinish,
    centerFinishTopCoat,
    centerFinishCustom,
    outerLipFinish,
    outerLipTopCoat,
    outerLipCustomTopCoat,
    innerBarrelFinish,
    innerBarrelTopCoat,
    innerBarrelCustomTopCoat,
    hardwareFinish,
    hardwareFinishCustom,
  } = req.body;

  res.status(200).end();

  if (shopDomain === "variantwheels.com") {
    console.log("Correct Shop Domain, Running SendMail!");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // sgMail.setDataResidency('eu');
    // uncomment the above line if you are sending mail using a regional EU subuser
    const noneSelectedText = "None selected";
    const ifNameInput = `by ${name}`;
    const msg = {
      to: ["jose@josenaranjo.dev", "sales@variantwheels.com"],
      from: "sales@variantwheels.com",
      subject: "New Variant wheels Form Submission",
      text: "Unlock Price Requested",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1a1a1a; font-size: 24px; font-weight: bold; text-align: center;">
            New Hulk Form Submission ${name ? ifNameInput : ""}
          </h2>
          <p style="font-size: 18px; margin: 5px 0; ${
            name ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Name: </strong> ${
              name || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            email ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Email: </strong> ${
              email || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            phone ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Phone: </strong> ${
              phone || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            wheel ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Wheel: </strong> ${
              wheel || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            frontDiameter ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Front Diameter: </strong> ${
              frontDiameter || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            frontWidth ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Front Width: </strong> ${
              frontWidth || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            frontOffset ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Front Offset: </strong> ${
              frontOffset || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            rearDiameter ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Rear Diameter: </strong> ${
              rearDiameter || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            rearWidth ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Rear Width: </strong> ${
              rearWidth || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            rearOffset ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Rear Offset: </strong> ${
              rearOffset || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            centerFinish ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Center Finish: </strong> ${
              centerFinish || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            centerFinishTopCoat ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Center Finish Top Coat: </strong> ${
              centerFinishTopCoat || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            centerFinishCustom ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Center Finish Custom: </strong> ${
              centerFinishCustom || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            outerLipFinish ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Outer Lip Finish: </strong> ${
              outerLipFinish || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            outerLipTopCoat ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Outer Lip Top Coat: </strong> ${
              outerLipTopCoat || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            outerLipCustomTopCoat ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Outer Lip Custom Top Coat: </strong> ${
              outerLipCustomTopCoat || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            innerBarrelFinish ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Inner Barrel Finish: </strong> ${
              innerBarrelFinish || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            innerBarrelTopCoat ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Inner Barrel Top Coat: </strong> ${
              innerBarrelTopCoat || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            innerBarrelCustomTopCoat ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Inner Barrel Custom Top Coat: </strong> ${
              innerBarrelCustomTopCoat || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            hardwareFinish ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Hardware Finish: </strong> ${
              hardwareFinish || noneSelectedText
            }
          </p>
          <p style="font-size: 18px; margin: 5px 0; ${
            hardwareFinishCustom ? "" : "opacity: .6;"
          }">
            <strong style="font-weight: bold;">Hardware Finish Custom: </strong> ${
              hardwareFinishCustom || noneSelectedText
            }
          </p>
        </div>
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
app.use("/", pageRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});
app.use(globalErrorHandler);

const port = 3005;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
