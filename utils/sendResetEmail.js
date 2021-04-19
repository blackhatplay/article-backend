const sgMail = require("@sendgrid/mail");
const { resetUrl } = require("../constants/urls");
const emailTemplate = require("../constants/emailTemplate");
sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = ({ email, token }) => {
  const msg = {
    to: email,
    from: "blackhatbud@gmail.com", // Use the email address or domain you verified above
    subject: "Email confirmation",
    html: emailTemplate(`${resetUrl}?token=${token}`),
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
};
