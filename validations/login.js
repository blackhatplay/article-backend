const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.user = !isEmpty(data.user) ? data.user : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.user)) {
    errors.user = "User is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
