import events from "./events";
import Gun from "gun/gun";
import "gun/sea";
import "gun/lib/then";
import "gun/lib/open";
import "gun/lib/load";
import bucket from "./bucket";

document.env = process.env.DEVELOPMENT || "development";

const weir = {
	bucketsList: [],
	buckets: new Map(),
	get events() { return events },
};
export default weir;

export const tank = (options) => {
	const {
		namespace = "@pp",
		listeners,
		peers,
		debug,
		...gunOptions
	} = options;

	const oldNamespace = localStorage.getItem("weir-ns");

	if (oldNamespace === null) {
		localStorage.setItem("weir-ns", namespace);
	} else if (oldNamespace && oldNamespace !== namespace) {
		localStorage.clear();
		localStorage.setItem("weir-ns", namespace);
		window.location.reload();
		return;
	}

	weir.gun = Gun(peers, gunOptions);
	weir.app = weir.gun.get(namespace);
	weir.private = Gun({ websocket: false, localStorage: false });

	if (debug) window.weir = weir;

	return { bucket };
};
