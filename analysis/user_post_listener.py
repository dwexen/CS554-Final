
import csv
from redis_listener import RedisListener
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId

from text_analyzer import TextAnalyzer

USER_POST_CHANNEL = "cs554-final/user.post"
TRAINING_DATA_PATH = "data/dataset-fb-valence-arousal-anon.csv"

training_data = [ line[0] for line in csv.reader(TRAINING_DATA_PATH) ]

class UserPostListener(RedisListener):

  def __init__(self, verbosity=0):
    RedisListener.__init__(self, USER_POST_CHANNEL)

    # Initialize mongo and the analyzer
    self._mongo_client = MongoClient("localhost", 27017)
    self._users = self._mongo_client["cs554-final"]["users"]
    self._analyzer = TextAnalyzer(training_data, n_topics = 3,
                                  verbosity=verbosity)

  def on_message(self, message):
    analysis = self._analyzer(message["post"])

    # If the analysis comes back with no topics, we can safely discard this
    # post...it doesn't tell us anything about the user
    if len(analysis.topics) <= 0:
      return

    result = self._users.find_one_and_update(
      { "_id": message["user"] },
      { "$update": { "interests": { topic: { "$push": {
          "pos": analysis.pos,
          "neg": analysis.neg,
          "neu": analysis.neu
        }
      } for topic in analysis.topics } } },
      return_document = ReturnDocument.AFTER
    )
    print(result)
    print("User:", message["user"])
    print("Post:", message["post"])

