const Database = require("../lib");

const db = new Database();

test("put#simple", function() {
	const val = {
		a: "a"
	};

	db.put(val);
	expect(db._internal_data).toMatchObject({ a: "a" });
});

test("put#nested", function() {
	const val = {
		a: {
			x: "x"
		}
	};

	db.put(val);

	expect(db._internal_data).toMatchObject({
		a: { x: "x" }
	});
});

test("put#simple array", function() {
	const val = {
		a: [1, 2, 3]
	};

	db.put(val);

	expect(db._internal_data).toMatchObject({
		a: [1, 2, 3]
	});
});

test("put#array of object", function() {
	const val = {
		a: [{ id: 1 }, { id: 2 }, { id: 3 }]
	};

	db.put(val);

	expect(db._internal_data).toMatchObject({
		a: [{ id: 1 }, { id: 2 }, { id: 3 }]
	});
});

test("put#circular object", function() {
	const val = {
		b: 1
	};
	val.a = val;

	db.put(val);

	expect(db._internal_data).toMatchObject({
		b: 1
	});
	expect(db._internal_data.a).toBe(db._internal_data);
});

test("put#complex circular object", function() {
	const val = {
		a: {
			x: 1
		}
	};
	val.b = val.a;

	db.put(val);
	expect(db._internal_data).toBe(db._internal_data.a);
	expect(db._internal_data).toBe(db._internal_data.b);
});

test("put#clear circular object", function() {
	const val = {
		a: null,
		b: null
	};

	db.put(val);
	expect(db._internal_data).toMatchObject({
		a: null,
		b: null,
		x: 1
	});
});

test("put#normalize data", function() {
	db.reset();
	const posts = [
		{ id: 1, text: "post1", users: [{ id: 1, name: "user1" }] },
		{ id: 2, text: "post1", users: [{ id: 2, name: "user2" }] }
	];

	const val = {
		posts: {},
		users: {}
	};

	posts.forEach(post => {
		val.posts[post.id] = post;
		post.users.forEach(user => {
			val.users[user.id] = user;
		});
	});

	db.put(val);
	const user1 = db._internal_data.posts[1].users[0];
	const user2 = db._internal_data.posts[2].users[0];

	expect(db._internal_data["users"][1]).toBe(user1);
	expect(db._internal_data["users"][2]).toBe(user2);
});

test("put#normalize data and update", function() {
	db.reset();
	const posts = [{ id: 1, text: "post1", users: [{ id: 1, name: "user1" }] }];

	const val = {
		posts: {},
		users: {}
	};

	posts.forEach(post => {
		val.posts[post.id] = post;
		post.users.forEach(user => {
			val.users[user.id] = user;
		});
	});

	db.put(val);

	const val2 = {
		users: {
			1: {
				name: "user2"
			}
		}
	};
	db.put(val2);
	expect(db._internal_data["posts"][1]["users"][0]).toMatchObject({
		id: 1,
		name: "user2"
	});
});

test("put#array of array", function() {
	const val = {
		posts: [[1, 2, 3]]
	};

	db.put(val);
	expect(db._internal_data["posts"]).toEqual([[1, 2, 3]]);
});

test("put#_ not allowed", function() {
	const val = {
		_: [[1, 2, 3]]
	};

	expect(() => db.put(val)).toThrow(
		"Unfortunaly _ property name is reserved"
	);
});
