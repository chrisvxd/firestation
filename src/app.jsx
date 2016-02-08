import React from 'react';
import ReactDOM from 'react-dom';

import configuration from '../firestation.config.js';

import 'elemental/less/elemental.less';

import FirebaseTable from 'components/firebase-table.jsx';

export default React.createClass({
    getInitialState: function () {
        return {
            currentTable: configuration.defaultChild
        };
    },
    componentWillMount: function () {
        this.ref = configuration.ref;
    },
    componentWillUnmount: function () {
        this.ref.off();
    },
    childChanged: function (event) {
        this.setState({
            currentTable: event.target.value
        });
    },
    render: function() {
        var childrenOptions = [];

        for (var key in configuration.children) {
            childrenOptions.push(
                <option key={key} value={key}>{key}</option>
            );
        };

        return (
            <div>
                <h1>{this.state.currentTable}</h1>

                <select value={this.state.currentTable} onChange={this.childChanged}>
                  {childrenOptions}
                </select>

                <FirebaseTable key={this.state.currentTable} child={this.state.currentTable}/>
            </div>
        )
    }
});
