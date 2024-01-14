const { Sequelize } = require("sequelize");

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Adjust this based on your PostgreSQL server's SSL configuration
      },
    },
  }
);

// {
//     dialect: "postgres",
//     host: process.env.DB_HOST, // Replace with your RDS endpoint
//     port: process.env.DB_PORT, // Default PostgreSQL port
//     username: process.env.DB_USER, // Replace with your RDS username
//     password: process.env.DB_PASSWORD, // Replace with your RDS password
//     database: process.env.DB_NAME, // Replace with your RDS database name
//     logging: false, // Disable logging SQL queries (optional)
//   }
