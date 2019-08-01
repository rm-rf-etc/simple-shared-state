
/*
EXAMPLE: How to use the methods.

const schema = {
	'page/1': {
		title: 'Lorem Ipsum 1',
		body: 'asdf asdf asdf asdf asdf asdf',
	},
	'page/2': {
		title: 'Lorem Ipsum 2',
		body: 'asdf asdf asdf asdf asdf asdf',
	},
	'meta/1': {
		desc: 'asdf asdf asdf',
	},
};
const relationships = [
	[gun.get('page/1').get('meta'), gun.get('meta/1')],
	[gun.get('page/2').get('meta'), gun.get('meta/1')],
];

seed(seeds);
link(relationships);
*/

export const seed = (seeds) => {
	Object.entries(seeds).forEach(([key, val]) => {
		gun.get(key).put(val);
	});
};

export const link = (attachments) => {
	attachments.forEach(([parent, child]) => {
		parent.put(child);
	});
};
