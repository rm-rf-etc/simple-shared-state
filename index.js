import { PureComponent } from 'react';
import _intrnl from './internal';
import bind from './bind';
import Gun from 'gun/gun';
import 'gun/lib/then';


const getData = (rootStr) => (
	_intrnl.read.app ? _intrnl.read.app.get(rootStr) : null
);

class Data extends PureComponent {

	constructor(props) {
		super(props);
		const { peers, options, root: rootStr } = props;

		const gun = Gun(peers, options);
		_intrnl.write = {
			app: gun.get(rootStr),
			gun,
		};
	}

	render() {
		return this.props.children;
	}
};

export { bind, getData, Data };
