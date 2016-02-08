import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.jsx';

import configuration from '../firestation.config.js';

ReactDOM.render(<App />, document.getElementById('app'));

configuration.auth(function (ref) {
    ReactDOM.render(<App />, document.getElementById('app'));
});
