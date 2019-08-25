import { PureComponent } from 'react';
import _intrnl from './internal';
import bind from './bind';
import Gun from 'gun/gun';
import 'gun/lib/then';


class Data extends PureComponent {

	constructor(props) {
		super(props);
		const { peers, indices, options, namespace = '@app' } = props.config;

		const gun = Gun(peers, options);
		_intrnl.init(gun, gun.get(namespace), indices);
	}

	render() {
		return this.props.children;
	}
};

export { bind, Data };
