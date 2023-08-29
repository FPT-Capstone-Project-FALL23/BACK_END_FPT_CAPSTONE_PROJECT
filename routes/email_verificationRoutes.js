const { route } = require("./authRoutes");

const express = require("express").Router();


route.post("/", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) throw Error("An email is required!");
    } catch (error) {
        
    }
})