import React from 'react';
import ReactDOM from 'react-dom';
import App1 from './appSSS';
import App2 from './appRedux';
import { Provider } from 'react-redux';
import reduxStore from './storeRedux';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App1 />, document.getElementById('root1'));
ReactDOM.render(
    <Provider store={reduxStore}>
        <App2 />
    </Provider>,
    document.getElementById('root2'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
