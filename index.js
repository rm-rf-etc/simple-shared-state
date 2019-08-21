import { PureComponent } from 'react';
import _intrnl from './internal';
import bind from './bind';
import scan from './scan';
import Gun from 'gun/gun';
import 'gun/lib/then';
// import 'gun/lib/load';
// import 'gun/lib/unset';

let gun;

export const getData = (rootStr) => (
	_intrnl.read.app ? _intrnl.read.app.get(rootStr) : null
);

export class Data extends PureComponent {

	componentWillMount() {
		// console.log('PROVIDER: willMount()');
		const { peers, options, root: rootStr } = this.props;

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

export { bind, scan };
