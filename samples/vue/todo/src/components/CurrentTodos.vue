<template>
	<div id="current-todos" class="container">
		<h3 v-if="todos.length > 0">Current({{todos.length}})</h3>
		<ul class="list-group">
			<li class="list-group-item" v-for="todo in todos">
				{{todo.body}}
				<div class="btn-group">
					<button type="button" @click="edit(todo)" class="btn btn-default btn-sm">
						<span class="glyphicon glyphicon-edit"></span> Edit
					</button>
					<button type="button" @click="complete(todo)" class="btn btn-default btn-sm">
						<span class="glyphicon glyphicon-ok-circle"></span> Complete
					</button>
					<button type="button" @click="remove(todo)" class="btn btn-default btn-sm">
						<span class="glyphicon glyphicon-remove-circle"></span> Remove
					</button>
				</div>
			</li>
		</ul>
	</div>
</template>
<script>
const store = require("../store");

export default {
	data() {
		return {
			raw_todos: []
		}
	},
	created() {
		store.watch({ todos: [] }, val => {
			this.raw_todos = val.todos
		});
	},
	computed: {
		todos() {

			return this.raw_todos.filter((todo) => { return !todo.completed })
		}
	},
	methods: {
		edit(todo) {
			this.raw_todos.splice(this.raw_todos.indexOf(todo), 1)
			store.put({
				todos: this.raw_todos,
				newTodo: todo.body
			});
		},
		complete(todo) {
			todo.completed = !todo.completed;
			store.put({
				todos: this.raw_todos
			});


		},
		remove(todo) {
			this.raw_todos.splice(this.raw_todos.indexOf(todo), 1);
			store.put({
				todos: this.raw_todos
			});
		},

	}
}
</script>
<style>
.btn-group {
	float: right;
}
</style>