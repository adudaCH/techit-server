const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const users = require("./routes/users");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;

app.use(express.json());

const logger = (req, res, next) => {
    console.log(`${req.method + req.url}`);
    next();
};

mongoose
    .connect(process.env.DB)
    .then(() => console.log("Connected to MongoDB server"))
    .catch((error) => console.log(error));

app.use(logger);
app.use(cors());
app.use("/api/users", users);

app.listen(port, () => console.log(`Server started on port ${port}`));
