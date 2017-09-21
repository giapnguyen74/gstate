const connectHoc = require("./connect");
const GState = require("../../../../lib");
const store = new GState();

const parent = {
	name: "Giap"
};
const child = {
	name: "Vinh"
};

parent.child = child;
child.parent = parent;
store.set({
	parent,
	child
});

function update_parent_name(value) {
	store.set({
		parent: {
			name: value
		}
	});
}

function update_child_name(value) {
	store.set({
		child: {
			name: value
		}
	});
}

module.exports = {
	update_parent_name,
	update_child_name,
	connect: connectHoc(store)
};
