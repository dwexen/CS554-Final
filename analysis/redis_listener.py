
import redis, json

r = redis.StrictRedis(host="localhost", port=6379, db=0)

class RedisListener:

  def __init__(self, channel):
    self._channel = r.pubsub()
    self._channel.subscribe(channel)

  def start(self):
    message = self._channel.listen()
    while True:
      msg = next(message)
      if msg["type"] == "message":
        self.on_message(json.loads(msg["data"].decode("utf-8")))

  def on_message(self, message):
    raise NotImplementedError("A subclass must override this method")

