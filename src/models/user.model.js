const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { ROLES } = require("../constant/role");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM(ROLES.USER, ROLES.ADMIN),
      defaultValue: ROLES.USER,
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["name"] },
      { fields: ["isDeleted", "isActive"] },
      { fields: ["createdAt"], order: [["createdAt", "DESC"]] },
    ],
  },
);

module.exports = User;
