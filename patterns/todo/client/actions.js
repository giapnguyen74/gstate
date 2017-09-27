let nextTodoId = 0;
export const addTodo = (state, text) => {
	const id = nextTodoId++;
	state.set({
		todos: {
			[id]: {
				id,
				text,
				completed: false
			}
		}
	});
};

export const setVisibilityFilter = (state, filter) => {
	state.set({
		filter: filter
	});
};

export const toggleTodo = (state, id) => {
	const completed = state.get(["todos", id, "completed"]);

	state.set({
		todos: {
			[id]: {
				completed: !completed
			}
		}
	});
};
