const express = require('express');
const router = express.Router();
const data = require("../data");
const pages = data.pages;

router.get("/pages", (req, res) => {
    pages.getAllPages().then((pagesList) => {
        res.json(pagesList);
    }).catch(() => {
        // Something went wrong with the server!
        res.sendStatus(500);
    });
});

router.get("/", (req, res) => {
    // pages.getAllPages().then((pagesList) => {
    //     res.render("home", {});
    // }).catch(() => {
    //     // Something went wrong with the server!
    //     res.sendStatus(500);
    // });
    res.render("home", {});
});

module.exports = router;