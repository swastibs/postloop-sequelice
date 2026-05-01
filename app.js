const path = require("path");
const express = require("express");
const passport = require("passport");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

require("./src/config/passport");
const indexRoute = require("./src/routes/index.route");
const { globalErrorHandler } = require("./src/middlewares/globalErrorHandeler");
const { connectDB } = require("./src/config/db");
const connectMongo = require("./src/config/mongo");
const activityLogger = require("./src/middlewares/activityLogger.middleware");

const app = express();

connectDB();
connectMongo();

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(require("./src/config/swagger-output.json"), {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
  }),
);

app.use(express.json());

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static(path.join(__dirname, "src/public")));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.session.user || null;
  next();
});

app.use(passport.initialize());

app.use(activityLogger);

app.use("/", indexRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

app.use(globalErrorHandler);

module.exports = app;
