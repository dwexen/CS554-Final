const crawler = require("./crawler");


var testWords = ["stemming", "technology", "new", "computer", "programming", "science", "politics", "trump"];
//crawler.startCrawl("http://www.arstechnica.com", testWords, 10);
crawler.startCrawl("http://www.reddit.com", testWords, 100);