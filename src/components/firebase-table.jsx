import React from 'react';
import ReactDOM from 'react-dom';

var elemental = require('elemental');
var Table = elemental.Table;

import configuration from '../../firestation.config.js';
import Row from './row.jsx';

var defaultResolve = function (val, callback) {
    callback(val);
};

export default React.createClass({
    getInitialState: function () {
        return {
            items: {}
        };
    },
    componentWillMount: function() {
        var items = {};

        var processSnapshot = function (snapshot) {
            var resolve = configuration.refs[this.props.refIndex].resolve || defaultResolve;

            resolve(snapshot.val(), function (val) {
                items[snapshot.key()] = val;
                this.setState({
                    items: items
                });
            }.bind(this));
        }

        configuration.refs[this.props.refIndex].ref.on('child_added', processSnapshot.bind(this));
        configuration.refs[this.props.refIndex].ref.on('child_changed', processSnapshot.bind(this));
    },
    componentWillUnmount: function () {
        configuration.refs[this.props.refIndex].ref.off();
    },
    render: function () {
        var refConfiguration = configuration.refs[this.props.refIndex].children;

        // Create table headers
        var headers = [];
        for (var i = 0; i < refConfiguration.length; i++) {
            var title = refConfiguration[i].title || refConfiguration[i].key;
            headers.push(<th key={i}>{title}</th>);
        };

        // Dynamically create rows based on ref configuration
        var rows = [];

        for (var key in this.state.items) {
            var item = this.state.items[key];
            rows.push(<Row key={key} item={item} itemKey={key} refIndex={this.props.refIndex} />);
        }

        return (
            <Table>
                <thead>
                    <tr>
                        <th>
                            <label>
                                <input type="checkbox" />
                            </label>
                        </th>
                        {headers}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        );
    }
});
