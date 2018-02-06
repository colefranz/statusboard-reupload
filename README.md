# QA Statusboard
    Some people, when confronted with a problem, think "I know, I'll use regular expressions." Now they have two problems.
    - Jamie Zawinski

Created in my free time as an internal tool. Original repo deleted as contained internal information
which should not be public. Used to automatically query to get information about the testing servers
as well as let QA know when they go up or down.

Credit to [Sara](https://github.com/sararathje) who made huge contributions to the original
repository and would not have been possible without her.

![Keep track of servers](/assets/main.png?raw=true "Main Page")
![Add new servers](/assets/new.png?raw=true "Create New Server")
![Use a minimal view and filter servers](/assets/minimal.png?raw=true "Minimal View w/ Filters Open")

## Setup

1. Install Node.js
2. Run `npm install -g grunt`
3. Install MongoDB https://www.mongodb.com/download-center
 * You will need to add the binaries to your path.
4. Navigate to the `server` folder
 * Create a data directory (mkdir data)
 * mongod --dbpath=./data --port 27017
 * Run `npm install`
5. Navigate to the `client` folder
 * Run `npm install`
 * Run `bower install`

## Running
1. In the command line, navigate to the `server` folder
2. Type `start` to duplicate this terminal
 * Note that order is important for the next 2 steps
 * Run `mongod --dbpath=./data --port 27017` in one terminal
 * Run `node index.js` in the other terminal
3. In another command line, navigate to the `client` folder
 * Run `grunt serve`
4. Navigate to `localhost:8000` to play in the sun

Alternatively, execute `run.bat`.
