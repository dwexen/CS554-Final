
import pandas as pd
import numpy as np

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer

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
    result += "Sent: " + self.document + "\n"
    result += "Pos: " + str(self.pos) + " "
    result += "Neg: " + str(self.neg) + " "
    result += "Neu: " + str(self.neu) + "\n"
    result += "Topics:\n"

    for topic in self.topics:
      result += "  " + str(topic) + "\n"

    return result


class TextAnalyzer:

  def __init__(self, training_docs,
               n_topics = 3,
               max_df = 0.01, ngram_range = (1, 2)):
    self._sid = SentimentIntensityAnalyzer()
    self._vectorizer = TfidfVectorizer(stop_words  = "english",
                                       max_df      = max_df,
                                       ngram_range = ngram_range)
    self._vectorizer.fit(training_docs)
    self.n_topics_ = n_topics

  def __call__(self, document):
    topics = self._vectorizer.transform([document])[0]
    sorted_topics = sorted(np.argwhere(topics[0])[:,1],
                           key = lambda x: topics[0, x],
                           reverse = True)
    feature_names = self._vectorizer.get_feature_names()
    topic_names = [ feature_names[i] for i in sorted_topics[:self.n_topics_] ]

    return TextAnalyzerReport(document, topic_names,
                              self._sid.polarity_scores(document))


data = pd.read_csv("data/dataset-fb-valence-arousal-anon.csv")
data = data.sample(frac=1)

ta = TextAnalyzer(data["Anonymized Message"])
result = ta("today i went to the farmer's market and bought some fantastic bread")

print(result)

