const GState = require("../src/index");
test("watch#simple", function() {
	const state = new GState();
	let calls = 0;
	let value = { a: "a" };
	state.set(value);
	state.watch(
		() => {
			return state.get({
				a: 1
			});
		},
		result => {
			calls++;
			expect(result).toEqual(value);
		}
	);

	value = { a: "b" };
	state.set(value);

	expect(calls).toBe(2);
});
