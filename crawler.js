var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');


var START_URL; // = "http://www.arstechnica.com";
var SEARCH_WORDS;// = ["stemming", "technology", "new", "computer", "programming", "science", "politics", "trump"];
var MAX_PAGES_TO_VISIT;// = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
//var url = new URL(START_URL);
//var baseUrl = url.protocol + "//" + url.hostname;
var url;
var baseUrl;
let exportMethods = {
    startCrawl(start_url, search_words, max_pages)
    {
        SEARCH_WORDS = search_words;
        START_URL = start_url;
        MAX_PAGES_TO_VISIT = max_pages;
        url = new URL(start_url);
        baseUrl = url.protocol + "//" + url.hostname;
        pagesToVisit.push(START_URL);
        crawl();
    }
}

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;
  console.log("NUMPAGES VISITED: " + numPagesVisited);

  // Make the request
  console.log("Visiting page " + url);
  
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     if(error)
     {
         console.error(error);
     }
  
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       console.log("Num Pages Visted decremented from " + numPagesVisited);
       numPagesVisited--;
       console.log("to " + numPagesVisited);
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var isWordFound;
     for(var i = 0; i<SEARCH_WORDS.length; i++) 
     {
        isWordFound = searchForWordInBody($, SEARCH_WORDS[i]);
        if(isWordFound) 
        {
            console.log('Word ' + SEARCH_WORDS[i] + ' found at page ' + url);
        } 
     }
       collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     
  });
}

function searchForWordInBody($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}


module.exports = exportMethods;