import React from "react";
import { addTodo } from "./actions";

let AddTodo = ({ state }) => {
	let input;
	return (
		<div>
			<form
				onSubmit={e => {
					e.preventDefault();
					if (!input.value.trim()) {
						return;
					}
					addTodo(state, input.value);
					input.value = "";
				}}
			>
				<input
					ref={node => {
						input = node;
					}}
				/>
				<button type="submit">Add Todo</button>
			</form>
		</div>
	);
};

export default AddTodo;
