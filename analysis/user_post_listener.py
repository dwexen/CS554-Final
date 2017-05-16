
import csv
from redis_listener import RedisListener
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId
from nltk.stem import PorterStemmer

from text_analyzer import TextAnalyzer

USER_POST_CHANNEL = "cs554-final/user.post"
TRAINING_DATA_PATH = "data/dataset-fb-valence-arousal-anon.csv"

try:
  training_data = [ line[0] for line in csv.reader(open(TRAINING_DATA_PATH)) ]
except:
  training_data = [ line[0] for line in
                    csv.reader(open("analysis/" + TRAINING_DATA_PATH)) ]

class UserPostListener(RedisListener):
  """
  Extends the RedisListener base class
  """

  def __init__(self, stem=True, verbosity=0):
    RedisListener.__init__(self, USER_POST_CHANNEL)

    # Initialize mongo and the analyzer
    self._mongo_client = MongoClient("localhost", 27017)
    self._users = self._mongo_client["cs554-final"]["users"]
    self._analyzer = TextAnalyzer(training_data, n_topics = 2,
                                  verbosity=verbosity)
    self._verbosity = verbosity

    if stem:
      stemmer = PorterStemmer()
      self._stem = lambda word: stemmer.stem(word)
    else:
      self._stem = lambda word: word

  def on_message(self, message):
    analyses = [ self._analyzer(post) for post in message["posts"] ]
    user = self._users.find_one({ "_id": ObjectId(message["user"]) })

    if self._verbosity >= 1:
      print("User:", message["user"])
      print("Post:", message["posts"])

    for analysis in analyses:
      # If the analysis comes back with no topics, we can safely discard this
      # post...it doesn't tell us anything about the user
      if len(analysis.topics) <= 0:
        continue

      if "interests" not in user:
        user["interests"] = []

      for topic in analysis.topics:
        try:
          interest = next(i for i in user["interests"]
                          if i["stemmed_name"] == self._stem(topic))
        except:
          interest = { "name": topic,
                       "stemmed_name": self._stem(topic),
                       "pos": 0,
                       "neg": 0,
                       "neu": 0,
                       "count": 0 }
          user["interests"].append(interest)
        interest["pos"] += analysis.pos
        interest["neg"] += analysis.neg
        interest["neu"] += analysis.neu
        interest["count"] = interest["count"] + 1

      self._users.update({ "_id": user["_id"] }, user)

