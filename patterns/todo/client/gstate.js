import React from "react";

const gstate = (query, renderer) => {
	class Renderer extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				data: undefined,
				locals: {}
			};

			if (!props.state) {
				throw new Error(
					"Could not find state in props of gstate component. Please explicitly pass state as a prop to gstate component."
				);
			}
		}

		componentDidMount() {
			this._watcher = this.props.state.watch(query, data => {
				this.setState({
					data: data
				});
			});
		}

		componentWillUnmount() {
			this._watcher && this._watcher();
		}

		setLocals(locals) {
			this.setState({ locals });
		}

		render() {
			return renderer(
				this.props,
				this.state.data,
				this.state.locals,
				this.setLocals.bind(this)
			);
		}
	}
	return Renderer;
};

export default gstate;
