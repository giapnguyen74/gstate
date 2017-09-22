const io = require("socket.io-client");

$(function() {
	var socket = io.connect("http://localhost:8080");
	socket.on("messages", function(data) {
		if (Array.isArray(data)) {
			$("#messages").html("");
			data.forEach(msg => {
				$("#messages").append($("<p>" + msg + "</p>"));
			});
		}
	});
	$("form").submit(function() {
		socket.emit("new message", $("#m").val());
		$("#m").val("");
		return false;
	});
});
