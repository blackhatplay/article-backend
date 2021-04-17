const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.firstname = !isEmpty(data.firstname) ? data.firstname : "";
  data.lastname = !isEmpty(data.lastname) ? data.lastname : "";

  if (!Validator.isLength(data.firstname, { min: 2, max: 15 })) {
    errors.firstname = "FirstName must be between 2 and 15 character";
  }
  if (Validator.isEmpty(data.firstname)) {
    errors.firstname = "FirstName is required";
  }
  if (!Validator.isLength(data.lastname, { min: 2, max: 15 })) {
    errors.lastname = "Lastname must be between 2 and 15 character";
  }
  if (Validator.isEmpty(data.lastname)) {
    errors.lastname = "Lastname is required";
  }
  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(data.facebook)) {
      errors.facebook = "Not valid facebook handle";
    }
  }
  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) {
      errors.instagram = "Not valid instagram handle";
    }
  }
  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) {
      errors.youtube = "Not valid youtube handle";
    }
  }
  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(data.twitter)) {
      errors.twitter = "Not valid twitter handle";
    }
  }
  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(data.linkedin)) {
      errors.linkedin = "Not valid linkedin handle";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
