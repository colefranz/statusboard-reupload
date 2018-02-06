start cmd /K "cd server && mongod --dbpath=./data --port 27017"
start cmd /K "cd server && node index.js"
start cmd /K "cd client && grunt serve"
exit