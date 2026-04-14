const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Post = sequelize.define(
  "Post",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "posts",
    timestamps: true,
    indexes: [
      { fields: ["likeCount"] },
      { fields: ["isDeleted"] },
      { fields: ["createdAt"] },
      { fields: ["userId", "isDeleted"] },
    ],
  },
);

module.exports = Post;
