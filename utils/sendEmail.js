const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const { confirmationUrl } = require("../constants/urls");
const emailTemplate = require("../constants/emailTemplate");
sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = (user) => {
  const payload = {
    email: user.email,
    action: "verify",
  };

  jwt.sign(
    payload,
    process.env.email_secret,
    { expiresIn: "1d" },
    (err, token) => {
      if (err) return console.log(err);

      const msg = {
        to: user.email,
        from: "blackhatbud@gmail.com", // Use the email address or domain you verified above
        subject: "Email confirmation",
        html: emailTemplate(`${confirmationUrl}/${token}`),
      };

      sgMail.send(msg).then(
        () => {},
        (error) => {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        }
      );
    }
  );
};
