const express = require("express");
const app = express();

const configRoutes = require("./routes");
const crawler = require("./crawler");

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});

var testWords = ["stemming", "technology", "new", "computer", "programming", "science", "politics", "trump"];
//crawler.startCrawl("http://www.arstechnica.com", testWords, 10);
crawler.startCrawl("http://www.arstechnica.com", testWords, 40, .60);