import express, { json } from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import nodemailer from "nodemailer";

import fetch from "node-fetch";
import cron from "node-cron";
import fs from "fs";

const app = express();

// STATIC FOLDERS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");

//BODY PARSER MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET REQUEST
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});
app.get("/xtempo", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/xtempo.html"));
});
app.get("/socalwear", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/socalwear.html"));
});
app.get("/starlinker", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/starlinker.html"));
});
app.get("/coffeepots", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/coffeepots.html"));
});
app.get("/instagram_token", (req, res) => {
  try {
    const data = fs.readFileSync(tokenFilePath, "utf8");
    const json = JSON.parse(data);
    res.send(json.long_lived_access_token);
  } catch (error) {
    res.json(error);
  }
});

// POST request

// contact form post
app.post("/send", (req, res) => {
  const output = `
    <h2>From: ${req.body.name}</h2>
    <h4>Email: ${req.body.emailee}</h4>
    <p><strong>Message:</strong> ${req.body.message}</p>`;
  console.log(output);

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "jose-juan-naranjo@hotmail.com", // generated ethereal user
        pass: "kemex84dev$1", // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Shopify Contact Form" jose-juan-naranjo@hotmail.com', // sender address
      to: "jose-juan-naranjo@hotmail.com", // list of receivers
      subject: "Request For Contact ✔", // Subject line
      //text: "Hello world?", // plain text body
      html: output, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    res.render("mailsent");

    // Preview only available when sending through an Ethereal account
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

  main().catch(console.error);
});

// Instagram Access Token
const tokenFilePath = "./token.json";

const refreshAccessToken = async (longLivedAccessToken) => {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedAccessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.access_token) {
      const jsonData = JSON.stringify(
        { long_lived_access_token: data.access_token },
        null,
        4
      );
      fs.writeFileSync(tokenFilePath, jsonData);
      console.log("New Access Token: ", data.access_token);
    } else {
      console.error("Could not refresh access token", data);
    }
  } catch (error) {
    console.error("An error occurred while refreshing the access token", error);
  }
};

cron.schedule("0 0 1 * *", () => {
  try {
    const data = fs.readFileSync(tokenFilePath, "utf8");
    const json = JSON.parse(data);
    refreshAccessToken(json.long_lived_access_token);
  } catch {
    console.error("An error occurred:", error.message);
  }
});

// SERVER
app.listen(3005, () => {
  console.log("App listening on port 3005");
});
