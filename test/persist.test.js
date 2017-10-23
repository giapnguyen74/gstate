const adapter = require("./persist/nedb.adapter");
const GState = require("../src/index");
const persist = require("../src/persist")(adapter, {
	filename: __dirname + "/data/db.txt",
	autoload: true
});

function resetAdapter() {
	return persist.adapter._db.remove({});
}

test("persist#simple", async function() {
	await resetAdapter();
	const state = new GState();
	await persist.insert(state, "a.b", { a: "a" });
	expect(state.get("a.b")).toEqual({ a: "a" });
});

test("persist#insert and restore", async function() {
	await resetAdapter();
	const state = new GState();
	await persist.insert(state, "a.b", { a: "a" });
	expect(state.get("a.b")).toEqual({ a: "a" });

	const state2 = new GState();
	await persist.find(state2);
	expect(state2.get("a.b")).toEqual({ a: "a" });
});

test("persist#insert exepction", async function() {
	await resetAdapter();
	const state = new GState();
	await persist.insert(state, "a.b", { a: "a" });
	await persist
		.insert(state, "a.b", { a: "a" })
		.catch(err =>
			expect(err.message).toMatch(
				"Can't insert key a.b, it violates the unique constraint"
			)
		);
});

test("persist#insert and update", async function() {
	await resetAdapter();
	const state = new GState();
	await persist.insert(state, "a.b", { a: "a" });
	await persist.update(state, "a.b", { a: "b" });
	expect(state.get("a.b")).toEqual({ a: "b" });
});

test("persist#insert and remove", async function() {
	await resetAdapter();
	const state = new GState();
	await persist.insert(state, "a.b", { a: "a" });
	await persist.remove(state, "a.b");
	expect(state.get("a.b")).toEqual(undefined);
});

test("persist#insert ref object", async function() {
	await resetAdapter();
	const state = new GState();
	const value = {
		a: { a: "a" }
	};
	value.b = value.a;
	await persist.insert(state, "x", value);

	expect(state.get("x.b.a")).toEqual("a");
	const state2 = new GState();
	await persist.find(state2);
	expect(state2.get("x.b.a")).toEqual("a");
	expect(state2.get("x.a.a")).toEqual("a");
});
