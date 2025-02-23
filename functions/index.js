const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const functions = require("firebase-functions");

sgMail.setApiKey(functions.config().sendgrid.apikey);

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

exports.sendPinCodeEmail = onRequest(async (req, res) => {
  const {email, pinCode} = req.body;

  logger.info("Received email: %s, pinCode: %s", email, pinCode);

  if (!email || !pinCode) {
    logger.error("Missing email or pinCode");
    return res.status(400).send("Email et code PIN sont requis");
  }

  if (!emailRegex.test(email)) {
    logger.error("Invalid email format: %s", email);
    return res.status(400).send("Adresse email invalide");
  }

  const msg = {
    to: email,
    subject: "Votre Code PIN",
    text: `Votre code PIN est : ${pinCode}`,
    html: `<strong>Votre code PIN est : ${pinCode}</strong>`,
  };

  try {
    await sgMail.send(msg);
    logger.info("Email sent successfully to %s", email);
    res.status(200).send("Email envoyé avec succès");
  } catch (error) {
    logger.error("Error sending email", error);
    res.status(500).send("Erreur lors de l'envoi de l'email");
  }
});
