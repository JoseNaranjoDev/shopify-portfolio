import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
dotenv.config({ path: "./config.env" });
const recieveEmail = process.env.CONTACT_FORM_USER;
const emailPassword = process.env.CONTACT_FORM_PASSWORD;

export const contactFormEmail = (req, res) => {
  console.log("Homepage form Submission route hit!");
  const { name, email, message } = req.body;
  // Function to send email
  async function sendEmail() {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: recieveEmail,
        pass: emailPassword,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: "jose@josenaranjo.dev",
        to: "jose@josenaranjo.dev",
        subject: "New Webecom Form Submission",
        text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
        `,
      });
      console.log("Email sent:", info.response);
      return true; // Indicate success
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Propagate error
    }
  }

  sendEmail()
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Message sent successfully!" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Failed to send message." });
    });
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
