require("./controllers/index");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const path = require("path");
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");

const port = process.env.PORT;
const webAppUrl = process.env.WEB_APP_URL;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "static")));
app.use(fileUpload({}));
app.use("/api", router);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("DB connection has been established successfully.");
    app.listen(port, () => console.log("server started on PORT " + port));
  } catch (error) {
    console.log(error);
  }
};

start();
