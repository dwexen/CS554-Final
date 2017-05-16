
import numpy as np

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

class TextAnalyzerReport:

  def __init__(self, document, topics, polarity_scores):
    self.document = document
    self.topics = topics
    self.pos = polarity_scores["pos"]
    self.neg = polarity_scores["neg"]
    self.neu = polarity_scores["neu"]
    self.compound = polarity_scores["compound"]

  def __repr__(self):
    result = ""
    result += "Doc: " + self.document[:70].replace("\n", "")

    if len(self.document) > 70:
      result += "..."
    result += "\n"

    result += "Pos: " + str(self.pos) + " "
    result += "Neg: " + str(self.neg) + " "
    result += "Neu: " + str(self.neu) + "\n"
    result += "Topics: " + ", ".join(self.topics)

    return result


class TextAnalyzer:

  def __init__(self, training_docs,
               n_topics=3, retrain_after=10, training_limit=None,
               verbosity=0, max_df=1.00, ngram_range=(1, 1)):
    self._training_limit = training_limit
    self._retrain_after = retrain_after
    self._training_docs = training_docs
    self._untrained_docs = []
    self._sid = SentimentIntensityAnalyzer()

    self._vectorizer = TfidfVectorizer(stop_words  = "english",
                                       max_df      = max_df,
                                       min_df      = 0,
                                       ngram_range = ngram_range)
    #self._vectorizer = CountVectorizer(stop_words  = "english")

    self._vectorizer.fit(training_docs[training_limit:])
    self._verbosity = verbosity
    self.n_topics_ = n_topics

  def retrain(self):
    if self._verbosity >= 1:
      print("[TextAnalyzer] Re-training on",
            len(self._training_docs) + len(self._untrained_docs),
            "documents")
    self._training_docs += self._untrained_docs
    self._training_docs = self._training_docs[self._training_limit:]
    self._vectorizer.fit(self._training_docs)
    self._untrained_docs = []

  def __call__(self, document):
    if document == "":
      return None

    self._untrained_docs.append(document)

    if len(self._untrained_docs) >= self._retrain_after:
      self.retrain()

    # Don't forget to change fit_transform back to transform for TFIDF
    topics = self._vectorizer.fit_transform([document])[0]
    sorted_topics = sorted(np.argwhere(topics[0])[:,1],
                           key = lambda x: topics[0, x],
                           reverse = True)
    feature_names = self._vectorizer.get_feature_names()
    topic_names = [ feature_names[i] for i in sorted_topics[:self.n_topics_] ]

    polarity = [ self._sid.polarity_scores(d) for d in document.split(".") ]
    pos = sum([ p["pos"] for p in polarity ]) / len(polarity)
    neg = sum([ p["neg"] for p in polarity ]) / len(polarity)
    neu = sum([ p["neu"] for p in polarity ]) / len(polarity)
    compound = sum([ p["compound"] for p in polarity ]) / len(polarity)
    polarity = { "pos": pos, "neg": neg, "neu": neu, "compound": compound }
    polarity = self._sid.polarity_scores(document)

    return TextAnalyzerReport(document, topic_names, polarity)


