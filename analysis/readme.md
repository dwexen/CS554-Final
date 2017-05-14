
# Analysis

## Installation
Necessary python modules include:

- nltk
- scikit-learn
- pymongo
- redis

You'll get errors if they're not installed. Also, this requires python 3.

Both the article crawler and user post listener can be run simultaneously. To
activate each, run this directory as a module with the flag to specify which
module to run:

(in this directory)
- `python . --crawler` runs the crawler
- `python . --pubsub` runs the user post listener
- `python . -pc` runs both simultaneously
- `python . -pc -v` runs both verbosely

## Article Crawler
The `ArticleCrawler` class extends `WebCrawler`, which maintains a queue of urls
to visit and processes each page. The WebCrawler will look for "title" and
"description" metatags as well as textual content (must be inside an `<article>`
tag, otherwise the page is discareded).

The ArticleCrawler will take that content and store it in the mongo collection
`cs554-final.pages` (cs554-final is the db name) in the following format:

```js
{
  _id: ObjectId,

  title: string,
  description: string,
  date_accessed: ISODate,
  url: string,
  
  polarity: {
    neu: number         // within [0, 1]
    pos: number         // within [0, 1]
    neg: number         // within [0, 1]
  },
  
  topics: [ string ]    // [ 'united', 'states', 'brand', 'filmstruck' ]
}
```

## User Post Redis PubSub Listener
The `UserPostListener` is derived from `RedisListener`, which listens on a
specific channel for messages. When a message is published to
`cs554-final/user.post`, the listener will process the textual content of the
post and save it on the user's document in `cs554-final.users`.

User documents look as follows:

```js
{
  _id: ObjectId,
  name: string,
  
  // other fields, like pass hash, social media auth tokens, etc.
  
  interests: [
    {
      name: string,     // something the user is interested in, like 'python'
      neu: number,      // within [0, 1]
      pos: number,      // within [0, 1]
      neg: number       // within [0, 1]
    },
    ...
  ]
}
```

Objects in `interests` are not name-unique. For instance, if a user makes 10
posts about "javascript", there may be 10 objects in `interests` with
`name: 'javascript'` and various neu, pos, and neg values. This is done so that
a user's feelings about something can be averaged over many posts.

## Testing
Run `python user_pub.py {name} "{pretend social media post}"` to publish a fake
social media post belonging to a user. Make sure the listener is running,
otherwise nothing will be waiting to process the post.

Run `python user_query.py` to see each user, how they feel about certain things,
and articles that would be recommended for them.
**Important:** This file contains queries which will be useful for the back-end
               to make suggestions.
