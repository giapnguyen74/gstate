import React from "react";
import Footer from "./Footer";
import AddTodo from "./AddTodo";
import VisibleTodoList from "./VisibleTodoList";

const GState = require("../../../src");
const state = new GState();

const App = () => (
	<div>
		<AddTodo state={state} />
		<VisibleTodoList state={state} />
		<Footer state={state} />
	</div>
);

export default App;
