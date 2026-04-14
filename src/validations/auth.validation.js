const { Joi } = require("express-validation");

const email = Joi.string().email().lowercase().trim();
const password = Joi.string().trim().min(4).max(32);

exports.signUpSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(16).required(),
    email: email.required(),
    password: password.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .strip()
      .messages({ "any.only": "Passwords do not match" }),
  }).unknown(false),

  params: Joi.object().max(0),
  query: Joi.object().max(0),
};

exports.logInSchema = {
  body: Joi.object({
    email: email.required(),
    password: Joi.string().trim().required(),
  }).unknown(false),

  params: Joi.object().max(0),
  query: Joi.object().max(0),
};
