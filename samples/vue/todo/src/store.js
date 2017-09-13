const Database = require("../../../../lib");
const store = new Database();
store.put({
	todos: [],
	newTodo: ""
});
module.exports = store;
