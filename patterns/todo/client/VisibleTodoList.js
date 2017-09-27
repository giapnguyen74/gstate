import React from "react";
import TodoList from "./TodoList";
import gstate from "./gstate";
import { toggleTodo } from "./actions";

const getVisibleTodos = (todos = [], filter = "SHOW_ALL") => {
	switch (filter) {
		case "SHOW_ALL":
			return todos;
		case "SHOW_COMPLETED":
			return todos.filter(t => t.completed);
		case "SHOW_ACTIVE":
			return todos.filter(t => !t.completed);
	}
};

const TodoListWithState = gstate(
	{
		todos: {
			_: 1
		},
		filter: 1
	},
	(props, data) => {
		data = data || {};
		return (
			<TodoList
				todos={getVisibleTodos(data.todos, data.filter)}
				onTodoClick={id => toggleTodo(props.state, id)}
			/>
		);
	}
);
module.exports = TodoListWithState;
