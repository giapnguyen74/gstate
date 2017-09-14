import React from "react";
import ParentChild from "./ParentChild.jsx";

export default class App extends React.Component {
	render() {
		return (
			<div style={{ textAlign: "center" }}>
				<h1>Parent and Children recursive</h1>
				<ParentChild />
			</div>
		);
	}
}
