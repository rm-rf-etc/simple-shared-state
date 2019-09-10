const _global = (typeof window === 'undefined') ? global : window;
_global.window = _global;
window = { location: { reload: () => {} } };
_global.document = _global.document || {};
document.env = typeof process !== 'undefined' ? process.env.DEVELOPMENT : "development";

require('./polyfills');
import bucket from './bucket';

export { funnel } from './connect';
export { bucket };
export { tank } from './weir';
