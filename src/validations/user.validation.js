const { Joi } = require("express-validation");

const id = Joi.number().integer().positive().required().messages({
  "number.base": "ID must be a number",
  "number.integer": "ID must be an integer",
  "number.positive": "ID must be a positive number",
});

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);

exports.getAllUsersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    name: Joi.string().trim().min(1),
    email: Joi.string().email().trim(),
  }).unknown(false),
};

exports.userIdParamSchema = {
  params: Joi.object({
    userId: id,
  }).unknown(false),
  query: Joi.object({}),
};

exports.updateUserActionSchema = {
  params: Joi.object({
    userId: id,
    action: Joi.string().valid("active", "inactive", "promote").required(),
  }).unknown(false),
  query: Joi.object({}),
};

exports.getAllPostsOfUserSchema = {
  params: Joi.object({
    userId: id,
  }).unknown(false),
  query: paginationQuerySchema,
};

exports.getPostOfUserSchema = {
  params: Joi.object({
    userId: id,
    postId: id,
  }).unknown(false),
  query: Joi.object({}),
};

exports.getAllCommentsOfUserSchema = {
  params: Joi.object({
    userId: id,
  }).unknown(false),
  query: paginationQuerySchema,
};

exports.getCommentOfUserSchema = {
  params: Joi.object({
    userId: id,
    commentId: id,
  }).unknown(false),
  query: Joi.object({}),
};
