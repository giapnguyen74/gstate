import Vue from "vue";
import App from "./App.vue";

Vue.use(require("../../../../lib/vue"), {
	data: {
		todos: [],
		newTodo: ""
	}
});

new Vue({
	el: "#app",
	render: h => h(App)
});
