import React from 'react';
import ReactDOM from 'react-dom';

var elemental = require('elemental');
var Table = elemental.Table;

import configuration from '../../firestation.config.js';
import Row from './row.jsx';

export default React.createClass({
    getInitialState: function () {
        return {
            items: []
        };
    },
    componentWillMount: function() {
        var items = [];

        // Add child_changed support
        configuration.ref.child(this.props.child).on('child_added', function (snapshot) {
            items.push({
                key: snapshot.key(),
                val: snapshot.val()
            });
            this.setState({
                items: items
            });
        }.bind(this));
    },
    render: function () {
        var childConfiguration = configuration.children[this.props.child];

        // Create table headers
        var headers = [];
        for (var i = 0; i < childConfiguration.length; i++) {
            var title = childConfiguration[i].title || childConfiguration[i].key;
            headers.push(<th key={i}>{title}</th>);
        };

        // Dynamically create rows based on child configuration
        var rows = [];

        for (var i=0; i < this.state.items.length; i++) {
            rows.push(<Row key={i} item={this.state.items[i]} child={this.props.child} />);
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