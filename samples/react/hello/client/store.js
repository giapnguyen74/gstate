const Database = require("../../../../lib");
const store = new Database();
import { Component, createElement } from "react";

function connect(query) {
	return function(WrappedComponent) {
		class Connect extends Component {
			constructor(props, context) {
				super(props, context);
				this.state = { data: {} };
			}

			componentDidMount() {
				this._watcher = store.watch(query, val => {
					this.setState({ data: val });
				});
			}

			componentWillUnmount() {
				if (this._watcher) {
					this._watcher();
				}
			}

			render() {
				return createElement(
					WrappedComponent,
					Object.assign({}, this.props, {
						data: this.state.data,
						store: store
					})
				);
			}
		}

		return Connect;
	};
}

module.exports = {
	connect,
	store
};
