# CS554-Final

This is a webcrawler and article aggregator, tailored to you!

How to run:

1. Install a bunch of stuff
2. Update your read me to properly talk about these steps


All dependencies:
Python3
Pip3
Node (and a bunch of packages)
MongoDB
Redis-server
Install with brew(one command installs both): brew install python3
npm install or yarn install for all node dependencies

Run the crawler with the command python3 analysis --crawler
Run the pub/sub server with python3 analysis --pub/sub
If you want output, add the flag -v to either command
You have to run the webcrawler for about a minute to populate the database with enough meaningful data so your user page has stuff on it. In practice, this would keep running separately on a different server
