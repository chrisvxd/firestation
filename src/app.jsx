import React from 'react';
import ReactDOM from 'react-dom';

import configuration from '../firestation.config.js';

import 'elemental/less/elemental.less';

import FirebaseTable from 'components/firebase-table.jsx';

export default React.createClass({
    getInitialState: function () {
        return {
            currentRefIndex: 0
        };
    },
    childChanged: function (event) {
        this.setState({
            currentRefIndex: event.target.value
        });
    },
    render: function() {
        var refOptions = [];

        for (var i = 0; i < configuration.refs.length; i++) {
            refOptions.push(
                <option key={i} value={i}>{configuration.refs[i].title}</option>
            );
        };

        return (
            <div>
                <h1>{configuration.refs[this.state.currentRefIndex].title}</h1>

                <select value={this.state.currentRefIndex} onChange={this.childChanged}>
                  {refOptions}
                </select>

                <FirebaseTable key={this.state.currentRefIndex} refIndex={this.state.currentRefIndex}/>
            </div>
        )
    }
});
