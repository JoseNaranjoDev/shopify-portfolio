import cron from "node-cron";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import fs from "fs";

// Load env vars
dotenv.config({ path: "./config.env" });

const configData = JSON.parse(
  fs.readFileSync("./server/gelatoInstagramToken.json", "utf8")
);
const webecomData = JSON.parse(
  fs.readFileSync("./server/webecomDB.json", "utf8")
);

let LONG_LIVED_TOKEN;
const recieveEmail = webecomData.emailUser;
const emailPassword = webecomData.emailPass;

// Function to load the token
function loadToken() {
  try {
    const gelatoData = fs.readFileSync(
      "./server/gelatoInstagramToken.json",
      "utf8"
    );
    const gelatoDataParsed = JSON.parse(gelatoData);
    LONG_LIVED_TOKEN = gelatoDataParsed.instagramToken;
  } catch (error) {
    console.error("Error loading token:", error.message);
  }
}

// Function to refresh Instagram token
async function refreshInstagramToken() {
  try {
    const response = await axios.get(
      "https://graph.instagram.com/refresh_access_token",
      {
        params: {
          grant_type: "ig_refresh_token",
          access_token: LONG_LIVED_TOKEN,
        },
      }
    );

    const newToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    LONG_LIVED_TOKEN = newToken;

    fs.writeFileSync(
      "./server/gelatoInstagramToken.json",
      JSON.stringify(
        {
          instagramToken: newToken,
          lastUpdated: new Date(),
          expiresIn: expiresIn,
        },
        null,
        2
      ),
      "utf8"
    );

    console.log(`Token refreshed and saved: ${newToken}`);
  } catch (error) {
    console.error(
      "Error refreshing Instagram token:",
      error.response?.data || error.message
    );
  }
}

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
      subject: "Instagram token refreshed",
      text: `Long lived Access token is: ${LONG_LIVED_TOKEN}`,
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Schedule cron job
cron.schedule(
  "0 0 1 * *",
  () => {
    console.log("Running cron job every 30 days");
    refreshInstagramToken();
    sendEmail();
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

loadToken();

// async function getInstagramToken() {
//   try {
//     const response = await fetch(
//       "http://shopify.josenaranjo.dev/api/get-token?shopId=25361982"
//     );
//     const data = await response.json();
//     if (data.status === "success") {
//       console.log("Access Token Recieved");
//       instaToken = data.data.accessToken;
//       console.log("Insta token from Webecom site: ", instaToken);
//     } else {
//       console.error("Error:", data.message);
//     }
//   } catch (error) {
//     console.error("Fetch error:", error.message);
//   }
// }
// getInstagramToken();
