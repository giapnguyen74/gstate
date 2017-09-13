const Database = require("../lib");

const db = new Database();

test("get#simple", function() {
	const val = { a: "a" };
	db.put(val);

	const res = db.get({ a: 1 });
	expect(res).toEqual(val);
	expect(res).not.toBe(val);
});

test("get#get nested", function() {
	const val = {
		a: {
			x: {
				y: {
					z: "z"
				}
			}
		}
	};
	db.put(val);

	const res = db.get({ a: { x: { y: { z: 1 } } } });
	expect(res).toEqual({ a: { x: { y: { z: "z" } } } });
});

test("get#get all primitive props", function() {
	const val = {
		a: {
			x: "x",
			y: {
				n: 1
			}
		}
	};
	db.put(val);

	const res = db.get({ a: 1 });
	expect(res).toEqual({ a: { x: "x" } });
});

test("get#query primitive as array or object", function() {
	const val = {
		a: "a"
	};

	db.put(val);

	let res = db.get({ a: { x: 1 } });
	expect(res).toEqual({ a: "a" });

	db.get({ a: [{ x: 1 }] });
	expect(res).toEqual({ a: "a" });
});

test("get#query non existed prop", function() {
	const val = {
		a: "a"
	};

	db.put(val);

	let res = db.get({ b: { x: 1 } });
	expect(res).toEqual({ b: undefined });
});

test("get#query array of primitive as array", function() {
	const val = {
		a: [1, 2, 3]
	};

	db.put(val);

	let res = db.get({ a: [1] });
	expect(res).toEqual({ a: [1, 2, 3] });
});

test("get#query array of object as array", function() {
	const val = {
		a: [{ x: 1 }, { x: 2 }, { x: 3 }]
	};

	db.put(val);

	let res = db.get({ a: [1] });
	expect(res).toEqual({ a: [{ x: 1 }, { x: 2 }, { x: 3 }] });
});

test("get#query array of object as array of object", function() {
	const val = {
		a: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }]
	};

	db.put(val);

	let res = db.get({ a: [{ x: 1 }] });
	expect(res).toEqual({ a: [{ x: 1 }, { x: 2 }, { x: 3 }] });
});

test("get#query array of object as object", function() {
	const val = {
		a: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }]
	};

	db.put(val);

	let res = db.get({ a: { 0: 1, 1: 1 } });
	expect(res).toEqual({ a: { 0: { x: 1, y: 1 }, 1: { x: 2, y: 1 } } });
});

test("get#query  object as array ", function() {
	const val = {
		a: {
			x1: {
				text: "x1"
			},
			x2: {
				text: "x2"
			}
		}
	};

	db.put(val);

	let res = db.get({ a: [{ text: 1 }] });
	expect(res).toEqual({ a: [{ text: "x1" }, { text: "x2" }] });
});

test("get#nest array query", function() {
	const val = {
		a: [[[1, 2, 3]]]
	};

	db.put(val);

	let res = db.get({ a: [[[1]]] });
	expect(res).toEqual({ a: [[[1, 2, 3]]] });
});

test("get#query circular", function() {
	const val = {
		a: {
			x: "x"
		}
	};

	val.a.b = val;

	db.put(val);

	let res = db.get({ a: { x: 1, b: { a: { x: 1 } } } });
	expect(res).toEqual({ a: { x: "x", b: { a: { x: "x" } } } });
});

test("get#invalid query", function() {
	expect(() =>
		db.get({
			a: 2
		})
	).toThrow("Invalid query: 2");
	expect(() =>
		db.get({
			a: () => true
		})
	).toThrow("Invalid query");

	expect(() =>
		db.get({
			a: [1, 1, 1]
		})
	).toThrow("Invalid query: 1,1,1");

	expect(() =>
		db.get({
			a: [[1, 1, 1]]
		})
	).toThrow("Invalid query: 1,1,1");
});
