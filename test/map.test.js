const GState = require("../src/index");
test("onMapCallback#simple", function() {
	const state = new GState({
		onMapCallback(op, nodes) {
			if (op.sort) {
				return nodes.sort();
			}
		}
	});

	state.set({
		a: [5, 4, 8, 9]
	});

	const res = state.get({
		a: {
			_: 1,
			sort: true
		}
	});

	expect(res).toEqual({ a: [4, 5, 8, 9] });
});

const sift = require("sift");

test("onMapCallback#sift", function() {
	const state = new GState({
		onMapCallback(op, nodes) {
			if (op.query) {
				return sift(op.query, nodes);
			}
		}
	});

	state.set({
		a: [5, 4, 8]
	});

	const res = state.get({
		a: {
			_: 1,
			query: { $in: [5, 4] }
		}
	});

	expect(res).toEqual({ a: [5, 4] });
});

test("onMapCallback#sift object", function() {
	const state = new GState({
		onMapCallback(op, nodes) {
			if (op.query) {
				return sift(op.query, nodes);
			}
		}
	});

	state.set({
		group: {
			person1: {
				name: "a1",
				age: 20
			},
			person2: {
				name: "a2",
				age: 30
			},
			person3: {
				name: "a3",
				age: 45
			}
		}
	});

	const res = state.get({
		group: {
			_: {
				name: 1,
				age: 1
			},
			query: { age: { $gt: 20 } }
		}
	});

	expect(res).toEqual({
		group: [{ age: 30, name: "a2" }, { age: 45, name: "a3" }]
	});
});
