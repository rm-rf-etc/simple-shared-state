import Gun from "gun/gun";
import getTank from "./tank";
// import "gun/sea";

/* eslint no-undef: "error" */
/* eslint-env browser */

export default ({
	namespace = "@pp",
	listeners,
	peers,
	debug,
	reloadOnChange = false,
	devtools = null,
	...gunOptions
}) => {
	const oldNamespace = localStorage.getItem("weir-ns");

	if (oldNamespace === null) {
		localStorage.setItem("weir-ns", namespace);
	} else if (oldNamespace && oldNamespace !== namespace) {
		localStorage.clear();
		localStorage.setItem("weir-ns", namespace);
		if (typeof window.location !== "undefined") window.location.reload();
		return;
	}

	const tank = getTank({
		namespace,
		reloadOnChange,
		publicRoot: Gun(peers, gunOptions),
		privateRoot: Gun({ websocket: false, localStorage: false }),
		/* eslint-disable no-underscore-dangle */
		devtools: devtools === true && window.__REDUX_DEVTOOLS_EXTENSION__
			? window.__REDUX_DEVTOOLS_EXTENSION__ : null,
		/* eslint-enable */
	});

	if (debug && typeof window !== "undefined") window.tank = tank;

	return tank;
};
