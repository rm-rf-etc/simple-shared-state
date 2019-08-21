import getStateProps from 'react-gun/discoverProps';

export default (Component) => {
	Component.boundProps = getStateProps(Component);
	return Component;
};
