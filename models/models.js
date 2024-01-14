const sequelize = require("../db/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  learner_id: { type: DataTypes.INTEGER },
  role: { type: DataTypes.STRING, defaultValue: "LEARNER" },
  expert_id: { type: DataTypes.INTEGER },
});

const Learner = sequelize.define("learner", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  purpose: { type: DataTypes.STRING },
  topics: { type: DataTypes.STRING },
  way_for_learning: { type: DataTypes.STRING },
  goals: { type: DataTypes.STRING },
});
const Expert = sequelize.define("expert", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category: { type: DataTypes.STRING },
  bio: { type: DataTypes.STRING },
  link_of_media: { type: DataTypes.STRING },
  aditional_service: { type: DataTypes.STRING },
});

User.hasOne(Learner);
Learner.belongsTo(User);

User.hasOne(Expert);
Expert.belongsTo(User);

module.exports = {
  User,
  Learner,
  Expert,
};
