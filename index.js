import { PureComponent } from 'react';
import _intrnl from './internal';
import bind from './bind';
import Gun from 'gun/gun';
import 'gun/lib/then';
// import 'gun/lib/load';
// import 'gun/lib/unset';

let gun;

const getData = (rootStr) => (
	_intrnl.read.app ? _intrnl.read.app.get(rootStr) : null
);

class Data extends PureComponent {

	constructor(props) {
		super(props);
		// console.log('PROVIDER: willMount()');
		const { peers, options, root: rootStr } = props;

		gun = Gun(peers, options);
		_intrnl.write = {
			app: gun.get(rootStr),
			gun,
		};
	}

	render() {
		// console.log('PROVIDER: render()', );
		// console.log('gun is initialized:', !!_intrnl.app);
		return this.props.children;
	}
};

export { bind, getData, Data };
