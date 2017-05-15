const express = require('express');
const router = express.Router();
const data = require("../data");
const pages = data.pages;
const sampleData = require("../sampleData.json");

router.get("/pages", (req, res) => {
    res.json(sampleData);
    // pages.getAllPages().then((pagesList) => {
    //     res.json(pagesList);
    // }).catch(() => {
    //     // Something went wrong with the server!
    //     res.sendStatus(500);
    // });
});

router.get("/", (req, res) => {
    res.render("home", {});
});

module.exports = router;