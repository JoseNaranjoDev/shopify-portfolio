import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import validator from "validator";
dotenv.config({ path: "./config.env" });

const CONTACT_TO = "josenaranjo.dev@gmail.com";
const MIN_SUBMIT_MS = 3000;
const MAX_SUBMIT_AGE_MS = 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const ipHits = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const contactFormEmail = async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";
  const startedAtRaw = body.startedAt;

  if (honeypot) {
    return res
      .status(400)
      .json({ success: false, message: "Unable to send message." });
  }

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  if (name.length > 100) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid name." });
  }

  if (!validator.isEmail(email) || email.length > 254) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid email." });
  }

  if (message.length > 5000) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a message." });
  }

  const startedAt = Number(startedAtRaw);
  const now = Date.now();
  if (!Number.isFinite(startedAt) || startedAt > now + 5000) {
    return res
      .status(400)
      .json({ success: false, message: "Unable to send message." });
  }
  const elapsed = now - startedAt;
  if (elapsed < MIN_SUBMIT_MS || elapsed > MAX_SUBMIT_AGE_MS) {
    return res
      .status(400)
      .json({ success: false, message: "Unable to send message." });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
    });
  }

  const from = process.env.SENDGRID_VERIFIED_SENDER;
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !from) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send message." });
  }

  try {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: CONTACT_TO,
      from,
      replyTo: email,
      subject: "New portfolio contact form",
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    return res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send message." });
  }
};

export const VariantWheelsAccess = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or your allowed domain
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Shopify-Shop-Domain"
  );
  res.status(200).end();
};

export const variantSendgrid = async (req, res) => {
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
};
