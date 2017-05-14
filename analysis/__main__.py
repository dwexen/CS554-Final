
from threading import Thread
import argparse, sys

from article_crawler import ArticleCrawler
from user_post_listener import UserPostListener

parser = argparse.ArgumentParser(description="Start the text analyzer")
parser.add_argument("-c", "--crawler",
                    action="store_true",
                    help="Enable the web crawler")
parser.add_argument("-p", "--pubsub",
                    action="store_true",
                    help="Enable the redis pub-sub listener for user posts")
parser.add_argument("-v", "--verbosity",
                    action="count",
                    default=0,
                    help="Increase output verbosity")
parser.add_argument("--init-url",
                    type=str,
                    default="http://news.ycombinator.com",
                    help="Url to initially point the web crawler at")

args = parser.parse_args(sys.argv[1:])

if not args.crawler and not args.pubsub:
  print("Must use either --crawler or --pubsub")
  print("Use -h to see options")
  exit()

threads = []

if args.crawler:
  print("Starting web crawler")
  crawler = ArticleCrawler(args.init_url, verbosity=args.verbosity)
  crawler_thread = Thread(target=lambda: crawler.start())
  crawler_thread.daemon = True
  crawler_thread.start()
  threads.append(crawler_thread)

if args.pubsub:
  print("Starting user post listener")
  user_post_listener = UserPostListener(verbosity=args.verbosity)
  user_thread = Thread(target=lambda: user_post_listener.start())
  user_thread.daemon = True
  user_thread.start()
  threads.append(user_thread)

for t in threads:
  t.join()
