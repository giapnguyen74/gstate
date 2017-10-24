const GState = require("../src/index");
const adapter = require("./couchdb.adapter");
const persist = require("../src/persist")(
	adapter,
	"http://localhost:5984/gstate"
);

const state2 = new GState();
state2.watch(
	{
		items: {
			_: "$key"
		}
	},
	data => console.log(data)
);
persist.sync(state2);

const state1 = new GState();
setInterval(() => {
	persist.insert(state1, ["items", new Date().getTime()], { text: "aa" });
}, 2000);
