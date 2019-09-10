
const events = {
	queues: {
		buckets_ready: new Set(),
		struct_ready: new Set(),
	},
	on(name, fn) {
		if (events.queues[name]) events.queues[name].add(fn);
		else throw new Error(`No queue named '${name}'`);
	},
	emit(name, data) {
		if (events.queues[name]) {
			const removals = new Set();

			events.queues[name].forEach(fn => {
				fn(data) === Symbol.for('unlisten') && removals.add(fn);
			});
			removals.forEach(fn => {
				events.queues[name].delete(fn);
			});
		}
	},
};

export default events;
