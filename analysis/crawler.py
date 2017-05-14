
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

class WebCrawler:

  def __init__(self, action, init_pages=[], limit=float('inf'), verbosity=0):
    """
    Creates a new WebCrawler, complete with a trie for word storage and a list
    of occurrence dictionaries, which map url IDs to word counts (for the word
    pointing to that occurrence list).

    `action`      callable to be called whenever content for a page is found
    `init_pages`  are the entry points that the web crawler will first visit
    `limit`       is the maximum number of pages to visit
    """
    if limit is None:
      limit = float('inf')

    if type(init_pages == str):
      init_pages = [init_pages]

    if not callable(action):
      raise TypeError("'action' must be callable")

    self._action = action
    self._already_discovered = []
    self._limit = limit
    self._page_queue = init_pages.copy()
    self._verbosity = verbosity

  def enqueue_front(self, page):
    self._page_queue.insert(0, page)
    if self._verbosity >= 2:
      print("[WebCrawler] Enqueued (to front)", page)

  def enqueue(self, page):
    self._page_queue.append(page)
    if self._verbosity >= 2:
      print("[WebCrawler] Enqueued", page)

  def front(self):
    return self._page_queue[0] if len(self._page_queue) > 0 else None

  def pop(self):
    page = self.front()
    self._page_queue = self._page_queue[1:]
    if self._verbosity >= 2:
      print("[WebCrawler] Popped", page)
    return page

  def process_page(self, page=None):
    """
    Processes a single web page, given the url `page`. First, we extract all
    words from the page using BeautifulSoup and word_tokenize. Then, for each
    word, we find the occurrence list associated with the word within the trie
    and increment the count for this website.

    Next, grab all anchor tags on the page (<a>...</a>), and filter out those
    already seen and undesirable ones (for the purpose of this assignment,
    URLs without the protocol://netloc prefix are filtered out)
    """
    if len(self._already_discovered) >= self._limit:
      raise IndexError("No more pages")

    if page is None:
      page = self.pop()

    #print("Queue:", self._page_queue)
    # Download, parse, and extract information from page
    if page is None:
      raise BufferError("No more pages to process")

    if self._verbosity >= 1:
      print("[WebCrawler] Processing", page)

    try: request_page = requests.get(page, timeout=1)
    except KeyboardInterrupt: exit()
    except: return

    # If the page is not an html page (a document, image, etc.), disregard
    if "Content-Type" not in request_page.headers or \
       "text/html" not in request_page.headers["Content-Type"]:
      return
    soup = BeautifulSoup(request_page.content, "html.parser")
    [ script.extract() for script in soup.findAll("script") ]
    [ style.extract() for style in soup.findAll("style") ]

    # Only call the action on the page's article content...if there is no
    # <article> tag, well too bad
    article = soup.find("article")
    if article is not None:
      content = "\n".join([ p.getText() for p in article.findAll("p") ]).lower()
      if content.replace("\n", "") != "":
        self._action(url = page, content = content)

    # Extract anchor tags
    links = list(map(lambda anchor: urlparse(anchor.attrs["href"]
                                    if "href" in anchor.attrs
                                    else ""),
                     soup.findAll("a")))

    # Put all valid links found onto the queue
    page_url = urlparse(page)

    for link in links:
      scheme = ""
      if link.scheme == "":
        scheme = page_url.scheme + "://"

      netloc = ""
      if link.netloc == "" and link.path != "":
        netloc = page_url.netloc

      url = scheme + netloc + link.geturl()

      if link.netloc != "" and \
         url not in self._already_discovered and \
         url not in self._page_queue:
        self._page_queue.append(url)

    # Add this page to the already_discovered list while we have the mutex
    self._already_discovered.append(page)

  def start(self):
    self.process_page()
    while True:
      self.process_page()

