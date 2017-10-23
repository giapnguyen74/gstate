const nano = require("nano");

function path_to_id(path) {
	return path.join(".");
}

class CouchDbAdapter {
	constructor(options) {
		this._db = nano(options);
		this._nano = nano;
	}

	_find(query) {
		return new Promise((ok, fail) => {
			this._db.list({ include_docs: true }, (err, body) => {
				if (err) return fail(err);
				ok(body.rows.map(row => [row.doc._id, row.doc.v]));
			});
		});
	}

	_insert(path, value) {
		path = path_to_id(path);
		return new Promise((ok, fail) => {
			this._db.insert({ _id: path, v: value }, (err, body) => {
				if (err) return fail(err);
				ok();
			});
		});
	}

	_update(path, value) {
		path = path_to_id(path);
		return new Promise((ok, fail) => {
			this._db.head(path, (err, body) => {
				if (err) return fail(err);
				ok();
			});
		});
	}

	_remove(path) {
		path = path_to_id(path);
		return new Promise((ok, fail) => {
			this._db.head(path, (err, body) => {
				if (err) return fail(err);
				console.log(body);
				ok();
			});
		});
	}

	_sync(cb) {
		var feed = this._db.follow({ since: 0, include_docs: true });
		feed.on("change", function(change) {
			if (change.deleted) {
				cb("d", change.doc._id, change.doc.v);
			} else {
				cb("u", change.doc._id, change.doc.v);
			}
		});
		feed.follow();
	}
}

module.exports = function(options) {
	return new CouchDbAdapter(options);
};
