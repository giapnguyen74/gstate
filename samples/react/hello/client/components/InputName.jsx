import React from "react";
export default function({ data, store }) {
	const onChange = evt => {
		evt.preventDefault();
		store.put({
			value: evt.target.value
		});
	};

	return <input type="text" value={data.value} onChange={onChange} />;
}
