<template>
	<div id="get-todo" class="container">
		<input class="form-control" :value="newTodo" @change="getTodo" placeholder="I need to...">
		<button class="btn btn-primary" @click="addTodo">Add Todo</button>
	</div>
</template>
<script>
const store = require("../store");

export default {
	created() {
		store.watch({ newTodo: 1 }, val => {
			this.newTodo = val.newTodo;
		});
	},
	data() {
		return {
			newTodo: undefined
		}
	},
	methods: {
		getTodo(e) {
			store.put({
				newTodo: e.target.value
			});
		},
		addTodo() {
			const state = store.get({ todos: [], newTodo: 1 });
			state.todos.push({ body: state.newTodo, completed: false });
			state.newTodo = "";
			store.put(state);
		}
	}
}
</script>