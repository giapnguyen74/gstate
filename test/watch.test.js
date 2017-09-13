const Database = require("../lib");

const db = new Database();

test("watch#simple", async function() {
	let step = 0;
	db.watch(
		{
			a: 1
		},
		function(result) {
			if (step == 0) {
				expect(result).toEqual({ a: undefined });
			} else {
				expect(result).toEqual({ a: "a" });
			}
		}
	);
	step++;
	db.put({ a: "a" });
});

test("watch#nested", async function() {
	db.reset();

	let step = 0;
	db.watch(
		{
			a: {
				b: {
					c: 1
				}
			}
		},
		function(result) {
			if (step == 0) {
				expect(result).toEqual({ a: undefined });
			} else if (step == 1) {
				expect(result).toEqual({ a: { b: { c: "xxx" } } });
			} else if (step == 2) {
				throw new Error("Should not called");
			} else if (step == 3) {
				throw new Error("Should not called");
			} else if (step == 4) {
				expect(result).toEqual({ a: { b: "what" } });
			}
		}
	);

	step++;
	db.put({
		a: {
			b: {
				c: "xxx"
			}
		}
	});

	step++;
	db.put({ x: 1 });

	step++;
	db.put({
		a: {
			b: {
				d: "xxx"
			}
		}
	});

	step++;
	db.put({
		a: {
			b: "what"
		}
	});
});
test("watch#recursive update", async function() {
	db.reset();
	let step = 0;
	db.watch(
		{
			a: 1,
			b: {
				c: 1
			}
		},
		function(result) {
			if (step == 0) {
				expect(result).toEqual({ a: undefined });
			} else if (step == 1) {
				expect(result).toEqual({ a: "a" });
			} else if (step == 2) {
				expect(result).toEqual({ a: "a", b: { c: "c" } });
			} else if (step == 3) {
				expect(result).toEqual({ a: "a", b: { c: "d" } });
			}
		}
	);
	step++;
	const val = { a: "a", c: "c" };
	db.put(val);

	step++;
	val.b = val;
	db.put(val);

	step++;
	val.c = "d";
	db.put(val);
});
