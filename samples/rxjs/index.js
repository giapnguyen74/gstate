const GState = require("../../lib");
const state = new GState();
const Rx = require("rx");
function createObverable(query) {
	return Rx.Observable.create(function(observer) {
		return state.watch(query, res => observer.next(res));
	});
}

var observable = createObverable({
	a: 1
});

observable.subscribe(
	res => console.log(res),
	function(err) {
		console.log("Error: " + err);
	},
	function() {
		console.log("Completed");
	}
);

state.set({
	a: "a"
});

state.set({
	a: "b"
});

state.set({
	x: "b"
});

state.delete("a");
