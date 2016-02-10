import React from 'react';
import ReactDOM from 'react-dom';

import _ from 'lodash';

var elemental = require('elemental');
var Table = elemental.Table;

import configuration from '../../firestation.config.js';
import Row from './row.jsx';
import {getNestedValue, setNestedValue} from '../utils.js';

var defaultResolve = function (val, callback) {
    callback(val);
};

export default React.createClass({
    getInitialState: function () {
        return {
            items: [],
            orderBy: configuration.refs[this.props.refIndex].orderBy,
            orderByDirection: configuration.refs[this.props.refIndex].orderByDirection
        };
    },
    componentWillMount: function() {
        this.currentOrderBy = configuration.refs[this.props.refIndex].orderBy;
        this.currentOrderByDirection = configuration.refs[this.props.refIndex].orderByDirection;

        this.makeQuery();
    },
    makeQuery: function () {
        this.items = [];

        if (this.ref !== undefined) {
            this.ref.off();
        };

        this.ref = configuration.refs[this.props.refIndex].ref;

        var monitorRef = function () {
            this.ref.on('child_added', this.processSnapshot);
            this.ref.on('child_changed', this.processSnapshot);
            this.ref.on('child_removed', this.removeSnapshot);
        };

        // Run value once, then watch for children added
        this.ref.once('value', function (snapshot) {
            var i = 0;

            console.log('Queried firebase!');

            var resolve = configuration.refs[this.props.refIndex].resolve || defaultResolve;

            snapshot.forEach(function (snapshotChild) {
                resolve(snapshotChild.val(), function (val) {
                    this.items.push({
                        val: val,
                        key: snapshotChild.key()
                    });

                    i += 1;

                    if (i === snapshot.numChildren()) {
                        this.prepareAndSetState({items: this.items});
                        monitorRef.bind(this)();
                    };
                }.bind(this));
            }.bind(this));
        }.bind(this));

    },
    prepareAndSetState: function (state) {
        this.sortItems(); // in place
        this.setState(state);
    },
    processSnapshot: function (snapshot) {
        var resolve = configuration.refs[this.props.refIndex].resolve || defaultResolve;

        resolve(snapshot.val(), function (val) {
            var key = snapshot.key();

            var existingIndex = _.findIndex(this.items, {'key': key});

            var newItem = {
                val: val,
                key: key
            };

            if (existingIndex > -1) {
                if (JSON.stringify(this.items[existingIndex]) !== JSON.stringify(newItem)) {
                    this.items[existingIndex] = newItem
                    this.prepareAndSetState({items: this.items});
                }
            } else {
                this.items.push(newItem);
                this.prepareAndSetState({items: this.items});
            };
        }.bind(this));
    },
    removeSnapshot: function (snapshot) {
        var key = snapshot.key();
        var existingIndex = _.findIndex(items, {'key': key});

        delete items[existingIndex];
        this.setState({
            items: items
        });
    },
    componentWillUnmount: function () {
        configuration.refs[this.props.refIndex].ref.off();
    },
    handleSortClick: function (key) {
        if (key === this.currentOrderBy) {
            if (this.currentOrderByDirection === 'asc') {
                this.currentOrderByDirection = 'desc'
            } else {
                this.currentOrderByDirection = 'asc';
            }
        } else {
            this.currentOrderBy = key;
            this.currentOrderByDirection = 'asc';
        };

        // this.makeQuery();

        this.prepareAndSetState({
            orderBy: this.currentOrderBy,
            orderByDirection: this.currentOrderByDirection
        });
    },
    render: function () {
        var items = this.state.items;

        // Sorting
        if (this.state.orderBy) {
            items = _.orderBy(items, function (item) {
                return getNestedValue(item.val, this.state.orderBy);
            }.bind(this), this.state.orderByDirection);
        };

    // Sorts in place
    sortItems: function () {
        if (this.currentOrderBy) {
            this.items = _.orderBy(this.items, function (item) {
                return getNestedValue(item.val, this.currentOrderBy);
            }.bind(this), this.currentOrderByDirection);
        };
    },
        var refConfiguration = configuration.refs[this.props.refIndex].children;

        // Create table headers
        var headers = [];
        for (var i = 0; i < refConfiguration.length; i++) {
            var title = refConfiguration[i].title || refConfiguration[i].key;
            var key = refConfiguration[i].key;

            var headerClass = '';

            if (this.currentOrderBy === key) {
                if (this.currentOrderByDirection === 'asc') {
                    headerClass = 'Arrow isAsc'
                } else {
                    headerClass = 'Arrow isDesc'
                }
            };

            headers.push(
                <th key={i} onClick={this.handleSortClick.bind(null, key)} className='SortableHeader'>
                    {title}<div className={headerClass} />
                </th>
            );
        };

        // Dynamically create rows based on ref configuration
        var rows = [];

        for (var i = 0; i < this.state.items.length; i++) {
            var key = this.state.items[i].key;
            var val = this.state.items[i].val;
            rows.push(<Row key={key} item={val} itemKey={key} refIndex={this.props.refIndex} />);
        };

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
