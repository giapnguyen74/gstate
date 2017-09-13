<template>
	<div id="get-todo" class="container">
		<input class="form-control" :value="newTodo" @change="getTodo" placeholder="I need to...">
		<button class="btn btn-primary" @click="addTodo">Add Todo</button>
	</div>
</template>
<script>


export default {
	nqlx: {
		newTodo: 1
	},
	methods: {
		getTodo(e) {
			this.$store.put({
				newTodo: e.target.value
			});
		},
		addTodo() {
			const state = this.$store.get({ todos: [], newTodo: 1 });

			state.todos.push({ body: state.newTodo, completed: false });
			state.newTodo = "";
			this.$store.put(state);
		}
	}
}
</script>