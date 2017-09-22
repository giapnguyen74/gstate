var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(8080);

app.use(express.static("dist"));

var GState = require("../../src");
var state = new GState();
var counter = Date.now();

io.on("connection", function(socket) {
	console.log("client connect");
	const watcher = state.watch(
		{
			messages: {
				_: 1
			}
		},
		result => {
			console.log(result);
			if (result && Array.isArray(result.messages)) {
				socket.emit("messages", result.messages.slice(-10));
			}
		}
	);
	socket.on("disconnect", function() {
		console.log("client disconnect");
		watcher();
	});
	socket.on("new message", function(msg) {
		counter++;
		const id = new Date().getTime() + counter % 1e9;

		state.set({
			messages: {
				[id]: msg
			}
		});
	});
});
