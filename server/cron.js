const cron = require("node-cron");
const dotenv = require("dotenv");
const axios = require("axios");
const nodemailer = require("nodemailer");
const fs = require("fs");

dotenv.config({ path: "./config.env" });
const configData = JSON.parse(fs.readFileSync("./server/config.json", "utf8"));
let LONG_LIVED_TOKEN;
const recieveEmail = configData.emailUser;
const emailPassword = configData.emailPass;

// CRON JOB - NODEMAILER
// Function to refresh Instagram long-lived access token
function loadToken() {
  try {
    const data = fs.readFileSync("./server/config.json", "utf8");
    const config = JSON.parse(data);
    LONG_LIVED_TOKEN = config.instagramToken;
    //console.log(LONG_LIVED_TOKEN);
  } catch (error) {
    console.error("Error loading token:", error.message);
  }
}
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
      "./server/config.json",
      JSON.stringify(
        { instagramToken: newToken, lastUpdated: new Date() },
        null,
        2
      ),
      "utf8"
    );
    console.log(
      `Token refreshed and saved: ${newToken}, Expires in: ${expiresIn} seconds`
    );
  } catch (error) {
    console.error(
      "Error refreshing Instagram token:",
      error.response?.data || error.message
    );
  }
}

// Schedule cron job to run every 30 days
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

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: recieveEmail, // <-- your Gmail address
      pass: emailPassword, // <-- your app password (no spaces!)
    },
  });

  try {
    const info = await transporter.sendMail({
      from: "jose@josenaranjo.dev", // must match auth.user
      to: "jose@josenaranjo.dev",
      subject: "Instagram token refreshed",
      text: `Long lived Access token is: ${LONG_LIVED_TOKEN}`,
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

loadToken();
//refreshInstagramToken();

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
