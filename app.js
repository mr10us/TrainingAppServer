require("./controllers/index");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const fs = require("fs");
const https = require("https");

const port = process.env.PORT;

const options = {
  cert: fs.readFileSync("/etc/letsencrypt/live/vadick.online/fullchain.pem"),
  key: fs.readFileSync("/etc/letsencrypt/live/vadick.online/privkey.pem"),
};

const app = express();

app.use(cors());
app.use(express.json());
app.use('/static', express.static(__dirname + '/static'));

app.use(fileUpload({}));
app.use("/api", router);

app.use(errorHandler);

const server = https.createServer(options, app);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("DB connection has been established successfully.");
    server.listen(port, () => console.log("server started on PORT " + port));
  } catch (error) {
    console.log(error);
  }
};

start();
