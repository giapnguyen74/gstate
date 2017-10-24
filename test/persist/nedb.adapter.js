const Datastore = require("nedb");

function path_to_id(path) {
	return path.join(".");
}

class NedbAdapter {
	constructor(options = {}) {
		this._db = new Datastore(options);
	}

	_find(query) {
		return new Promise((ok, fail) => {
			this._db.find({}, (err, docs) => {
				if (err) return fail(err);
				const values = Array(docs.length);
				for (let i = 0; i < docs.length; i++) {
					const path = docs[i]._id;
					const v = docs[i].v;
					values[i] = [path, v];
				}
				ok(values);
			});
		});
	}

	_insert(path, value) {
		path = path_to_id(path);
		return new Promise((ok, fail) => {
			this._db.insert(
				{ _id: path, v: value },
				err => (err ? fail(err) : ok())
			);
		});
	}

	_update(path, value) {
		path = path_to_id(path);
		return new Promise((ok, fail) => {
			this._db.update(
				{ _id: path },
				{ $set: flatten("v", value) },
				(err, numAffected) =>
					err || numAffected == 0 ? fail(err) : ok()
			);
		});
	}

	_remove(path) {
		path = path_to_id(path);
		return new Promise((ok, fail) => {
			this._db.remove(
				{ _id: path },
				(err, numRemoved) => (err || numRemoved == 0 ? fail(err) : ok())
			);
		});
	}
}
module.exports = function(options) {
	return new NedbAdapter(options);
};
