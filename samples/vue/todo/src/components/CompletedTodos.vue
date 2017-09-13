<template>
	<div id="completed-todos">
		<h3 v-if="completed.length > 0">Completed({{completed.length}})</h3>
		<ul class="list-group">
			<li class="list-group-item" v-for="todo in completed">
				{{todo.body}}
				<button type="button" @click="remove(todo)" class="btn btn-default btn-sm">
					<span class="glyphicon glyphicon-remove-circle"></span> Remove
				</button>
			</li>
		</ul>
	</div>
</template>
<script>

export default {
	nqlx() {
		return {
			raw_todos: {
				query: {
					todos: []
				},
				cb: val => val.todos
			}
		}
	},
	computed: {
		completed() {
			return this.raw_todos.filter((todo) => { return todo.completed })
		}
	},
	methods: {
		remove(todo) {
			this.raw_todos.splice(this.raw_todos.indexOf(todo), 1);
			this.$store.put({
				todos: this.raw_todos
			});
		}
	},

}
</script>