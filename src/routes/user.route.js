const userRouter = require("express").Router();

const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const { ROLES } = require("../constant/role");
const {
  userIdParamSchema,
  getAllUsersSchema,
  updateUserActionSchema,
  getAllPostsOfUserSchema,
  getPostOfUserSchema,
  getAllCommentsOfUserSchema,
  getCommentOfUserSchema,
} = require("../validations/user.validation");

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUserAction,
  getAllPostsOfUser,
  getPostOfUser,
  getAllCommentsOfUser,
  getCommentOfUser,
} = require("../controllers/user.controller");
const { validate } = require("express-validation");
const { cacheMiddleware } = require("../middlewares/cache.middleware");
const { invalidateCache } = require("../middlewares/invalidate.middleware");

userRouter.use(authenticate);

userRouter.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllUsersSchema),
  cacheMiddleware(),
  getAllUsers,
);

userRouter.get(
  "/:userId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(userIdParamSchema),
  cacheMiddleware(),
  getUser,
);

userRouter.delete(
  "/:userId",
  authorize(ROLES.ADMIN),
  validate(userIdParamSchema),
  invalidateCache(["cache:/api/users*", "cache:/api/activities*"]),
  deleteUser,
);

userRouter.put(
  "/:userId/:action",
  authorize(ROLES.ADMIN),
  validate(updateUserActionSchema),
  invalidateCache(["cache:/api/users*", "cache:/api/activities*"]),
  updateUserAction,
);

userRouter.get(
  "/:userId/posts",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllPostsOfUserSchema),
  cacheMiddleware(),
  getAllPostsOfUser,
);

userRouter.get(
  "/:userId/posts/:postId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getPostOfUserSchema),
  cacheMiddleware(),
  getPostOfUser,
);

userRouter.get(
  "/:userId/comments",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllCommentsOfUserSchema),
  cacheMiddleware(),
  getAllCommentsOfUser,
);

userRouter.get(
  "/:userId/comments/:commentId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getCommentOfUserSchema),
  cacheMiddleware(),
  getCommentOfUser,
);

module.exports = userRouter;
