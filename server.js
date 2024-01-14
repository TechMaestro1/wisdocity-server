require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const http = require("http");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swaggerOptions");
const sequelize = require("./db/db");
const models = require("./models/models");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(cors());
app.use(express.json());
app.use(fileUpload({}));
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("hello postgres + node.js");
});

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, HOST, () => {
      console.log("Server start on port", PORT);
    });
  } catch (e) {
    console.log(e);
  }
};
start();
