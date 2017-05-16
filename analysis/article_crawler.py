
from sklearn.datasets import fetch_20newsgroups
from pymongo import MongoClient, ReturnDocument
from datetime import datetime
from nltk.stem import PorterStemmer

from crawler import WebCrawler
from text_analyzer import TextAnalyzer

class ArticleCrawler(WebCrawler):

  def __init__(self, init_url, stem=True, verbosity=0):
    WebCrawler.__init__(self, self.on_content, init_url, verbosity=verbosity)

    # Initialize mongo and the analyzer
    self._mongo_client = MongoClient("localhost", 27017)
    self._pages = self._mongo_client["cs554-final"]["pages"]
    self._analyzer = TextAnalyzer(fetch_20newsgroups(subset="train").data,
                                  n_topics = 5, verbosity=0)
    self._verbosity = verbosity

    if stem:
      stemmer = PorterStemmer()
      self._stem = lambda word: stemmer.stem(word)
    else:
      self._stem = lambda word: word

  def on_content(self, url, content, title, description):
    analysis = self._analyzer(content)

    # If the analysis comes back with no topics, we can safely discard this
    # article...it will never be the result of a query anyhow
    if len(analysis.topics) <= 0:
      return

    result = self._pages.find_one_and_replace(
      { "url": url },
      { "url": url,
        "polarity": {
          "pos": analysis.pos,
          "neg": analysis.neg,
          "neu": analysis.neu
        },
        "topics": analysis.topics,
        "stemmed_topics": [ self._stem(word) for word in analysis.topics ],
        "title": title,
        "description": description,
        "date_accessed": datetime.utcnow() },
      upsert = True,
      return_document = ReturnDocument.AFTER
    )
    if self._verbosity >= 1:
      print("Url:", url)
      print(analysis)
      print()

