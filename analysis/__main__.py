
from sklearn.datasets import fetch_20newsgroups
from crawler import WebCrawler
from text_analyzer import TextAnalyzer
from pymongo import MongoClient, ReturnDocument
from datetime import datetime

client = MongoClient("localhost", 27017)
db = client["cs554-final"]

pages = db["pages"]

def analyze_and_print(url, content):
  print("Url:", url)
  print(article_analyzer(content))
  print()

def analyze_and_store(url, content):
  analysis = article_analyzer(content)

  # If the analysis comes back with no topics, we can safely discard this
  # article...it will never be the result of a query anyhow
  if len(analysis.topics) <= 0:
    return

  result = pages.find_one_and_replace(
    { "url": url },
    { "url": url,
      "polarity": {
        "pos": analysis.pos,
        "neg": analysis.neg,
        "neu": analysis.neu
      },
      "topics": analysis.topics,
      "date_accessed": datetime.utcnow() },
    upsert = True,
    return_document = ReturnDocument.AFTER
  )
  print("Url:", url)
  print(analysis)
  print()

wc = WebCrawler(analyze_and_store, "http://arstechnica.com", verbosity=0)

print("Initializing text analyzer")
article_analyzer = TextAnalyzer(fetch_20newsgroups(subset="train").data,
                                n_topics = 30, verbosity=0)

print("Starting web crawler")
wc.start()

