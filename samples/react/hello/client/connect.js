import { Component, createElement } from "react";

function connect(context) {
	return query =>
		function(WrappedComponent) {
			class Connect extends Component {
				constructor(props, context) {
					super(props, context);
					this.state = { data: {} };
				}

				componentDidMount() {
					this._watcher = context.watch(query, val => {
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
							data: this.state.data
						})
					);
				}
			}

			return Connect;
		};
}

module.exports = connect;
