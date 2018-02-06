var express = require('express'),
		app = express(),
		MongoClient = require('mongodb').MongoClient,
		serverUtils = require('./serverUtils'),
		statusboard,
		collection,
		handleResponseCallback;
	
function updateServer(server) {
	database.collection("servers").updateOne(
		{name: server.name},
		{$set: server}
	);
}

function updateServers() {
	database.collection("servers").find().toArray(function(err, servers) {
		var i,
				server;

		if (err) return;
		
		for (i = 0; i < servers.length; i++) {
			serverUtils.getAllServerInformation(servers[i], updateServer);
		}
	});
}

// I don't know that this is the best way to use the mongo db connection
// but we basically just store the database reference and grab the collection
// every time that we need it.
// Once the connection is established we update everything every 15 seconds.
MongoClient.connect("mongodb://localhost:27017/statusboardDb", function(err, db) {
	if (err) {
		return console.dir(err);
	}

	database = db;

	updateServers();
	setInterval(updateServers, 15000);
});

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/server/new', function(req, res) {
	var data = JSON.parse(req.query.data);

	// Insert
	if (data.name !== undefined) {
		database.collection("servers").insertOne(data, function(err, r) {
			if (err) {
				res.status(500).send('Error communicating with database');
				
				return;
			}

			serverUtils.getAllServerInformation(data, updateServer);
			res.status(200).send();
		});
	} else {
		res.status(400).send('Data did not have a server name.');
	}
});

app.post('/server/update', function(req, res) {
	var data = JSON.parse(req.query.data);

	// Update
	if (data.name !== undefined) {
		// find our server and update it with the new data
		database.collection("servers").updateOne(
			{name: data.name},
			{$set: data},
			function(err, r) {
				if (err) {
					res.status(500).send('Error communicating with database');
					
					return;
				}

				res.status(200).send();
				
				return;
			}
		);
	} else {
		res.status(400).send('Data did not have a server name.');
	}
});

app.post('/server/delete', function(req, res) {
	var data = JSON.parse(req.query.data);

	// Update
	if (data.name !== undefined) {
		// find our server and update it with the new data
		database.collection("servers").findOneAndDelete(
			{name: data.name},
			function(err, r) {
				if (err) {
					res.status(500).send('Error communicating with database');
					
					return;
				}

				res.status(200).send();

				return;
			}
		);
	} else {
		res.status(400).send('Data did not have a server name.');
	}
});

app.get('/server', function(req, res) {
	database.collection("servers").findOne({name: req.query.name}, function(err, r) {
		if (err) {
			res.status(500).send('Error fetching from database');

			return;
		}

		res.status(200).send(JSON.stringify(r));

		return;
	});
});

app.get('/servers', function(req, res) {
	database.collection("servers").find().toArray(function(err, servers) {
		if (err) {
			res.status(500).send('Error fetching from database');

			return;
		}

		res.status(200).send(JSON.stringify(servers));
	});
});

// Delete all servers from database - mostly used
// for development purposes.
// app.post('/servers/delete', function(req, res) {
// 	database.collection("servers").removeMany();

// 	res.status(200).send();

// 	return;
// });

statusboard = app.listen(8081, function() {
	console.log('Listening on', statusboard.address().port);
});
