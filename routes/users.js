const express = require("express");
const router = express.Router();
const User = require("../models/User");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const authMiddleware = require("../middleware/authMiddleware");
const _ = require("lodash")

const registerSchema = Joi.object({
    name: Joi.string().required().min(2),
    email: Joi.string().required().email().min(2),
    password: Joi.string().required().min(8),
    isAdmin: Joi.boolean().required(),
});

const loginSchema = Joi.object({
    email: Joi.string().required().email().min(2),
    password: Joi.string().required().min(8),
});

//register
router.post("/", async (req, res) => {
    try {
        // 1.body validation
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        // 2. check for existing user
        let user = await User.findOne({ email: req.body.email });
        if (!!user) return res.status(400).send("User already exists");
        // 3.create user + encrypt password
        user = new User(req.body);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        console.log("User saved successfully:", user);
        //3.5 create cart
        // const cart = new Cart({ userId: user._id, products: [], active: true });
        // await cart.save();
        // 4. create token
        console.log("JWTKEY:", process.env.JWTKEY);
        const token = jwt.sign(
            { _id: user._id, isAdmin: user.isAdmin },
            process.env.JWTKEY
        );
        return res.status(201).send(token);
    } catch (error) {
        return res.status(400).send(error);
    }
});

// login
router.post("/login", async (req, res) => {
    try {
        // 1. body validation
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        // 2. check for existing user
        let user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("Email or Password are incorrect!");
        // 3. compare the passwords
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result)
            return res.status(400).send("Email or Password are incorrect!");
        // 4. create token
        const token = jwt.sign(
            { _id: user._id, isAdmin: user.isAdmin },
            process.env.JWTKEY
        );
        res.status(200).send(token);
    } catch (error) {
        res.status(400).send(error);
    }
});

// profile

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.payload._id);
        if (!user) return res.status(404).send("No such user"); 
        res.status(200).send(_.pick(user, ["_id", "email", "name", "isAdmin"]));
    } catch (error) {
        res.status(400).send(error);
    }
});
module.exports = router;
