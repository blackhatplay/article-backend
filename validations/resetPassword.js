const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.password, { min: 6, max: 15 })) {
    errors.password = "Password should be between 6 and 30 characters";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
