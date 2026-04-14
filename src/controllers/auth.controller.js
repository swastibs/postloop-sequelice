const jwt = require("jsonwebtoken");
const { hash, compare } = require("bcrypt");

const { User } = require("../models");
const { ROLES } = require("../constant/role");
const { sanitizedUser } = require("../utils/sanitizedUser");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/ApiResponse");
const { storeToken, deleteToken } = require("../utils/authCache");

// SIGN UP
exports.signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const isUserExist = await User.findOne({
      where: { email, isDeleted: false },
    });

    if (isUserExist) throw new ApiError(409, "Email already exist.");

    const hashedPassword = await hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.USER,
      isActive: true,
      isDeleted: false,
      deletedBy: null,
    });

    req.activity = {
      entity: "User",
      entityId: newUser.id,
    };

    return successResponse(res, {
      statusCode: 201,
      message: "User created successfully",
      data: sanitizedUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
exports.logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email, isDeleted: false },
    });

    if (!user) throw new ApiError(404, "User not exist");
    if (!user.isActive) throw new ApiError(403, "User is inactive");

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) throw new ApiError(401, "Invalid credentials");

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    await storeToken(jwtToken);

    return successResponse(res, {
      message: "Login Success",
      data: {
        token: `Bearer ${jwtToken}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
exports.logOut = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    await deleteToken(token);

    return successResponse(res, {
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
};
