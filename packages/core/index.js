import getTank from "./tank";
import Gun from "gun/gun";
// import "gun/sea";

export default ({
	namespace = "@pp",
	listeners,
	peers,
	debug,
	reloadOnChange = false,
	...gunOptions,
}) => {
	const oldNamespace = localStorage.getItem("weir-ns");

	if (oldNamespace === null) {
		localStorage.setItem("weir-ns", namespace);
	} else if (oldNamespace && oldNamespace !== namespace) {
		localStorage.clear();
		localStorage.setItem("weir-ns", namespace);
		typeof location !== 'undefined' && location.reload();
		return;
	}

	const tank = getTank({
		namespace,
		reloadOnChange,
		publicRoot: Gun(peers, gunOptions),
		privateRoot: Gun({ websocket: false, localStorage: false }),
	});

	if (debug && typeof window !== 'undefined') window.tank = tank;

	return tank;
};
