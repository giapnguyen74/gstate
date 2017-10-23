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
//persist.sync(state2);

const state1 = new GState();
setInterval(() => {
	persist.insert(state1, ["items", new Date().getTime()], { text: "aa" });
}, 2000);

const state3 = new GState();
persist.find(state3);
state3.watch(
	{
		items: {
			_: 1
		}
	},
	data => console.log(data)
);
