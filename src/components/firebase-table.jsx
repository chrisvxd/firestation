import React from 'react';
import ReactDOM from 'react-dom';

import _ from 'lodash';
require("string_score");

var elemental = require('elemental');
var Table = elemental.Table;
var Form = elemental.Form;
var FormField = elemental.FormField;
var FormInput = elemental.FormInput;
var Glyph = elemental.Glyph;
var GridRow = elemental.Row;
var GridCol = elemental.Col;
var Card = elemental.Card;
var Spinner = elemental.Spinner;

import configuration from '../../firestation.config.js';
import Row from './row.jsx';
import {getNestedValue, setNestedValue} from '../utils.js';

var defaultResolve = function (key, val, callback) {
    callback(val);
};

export default React.createClass({
    getInitialState: function () {
        return {
            items: [],
            orderBy: configuration.refs[this.props.refIndex].orderBy,
            orderByDirection: configuration.refs[this.props.refIndex].orderByDirection,
            openFilterFields: [],
            filtersByKey: {},
            loaded: false
        };
    },
    componentWillMount: function() {
        this.currentOrderBy = configuration.refs[this.props.refIndex].orderBy;
        this.currentOrderByDirection = configuration.refs[this.props.refIndex].orderByDirection;
        this.filters = {};

        this.makeQuery();
    },
    makeQuery: function () {
        this.items = [];

        if (this.ref !== undefined) {
            this.ref.off();
        };

        this.ref = configuration.refs[this.props.refIndex].ref;
        this.batchRef = configuration.refs[this.props.refIndex].batchRef || this.ref;

        var monitorRef = function () {
            this.ref.on('child_added', this.processSnapshot);
            this.batchRef.on('child_changed', this.processSnapshot);
            this.batchRef.on('child_removed', this.removeSnapshot);
        };

        // Run value once, then watch for children added
        this.batchRef.once('value', function (snapshot) {
            var i = 0;

            console.log('Queried firebase!');

            var resolve = configuration.refs[this.props.refIndex].resolve || defaultResolve;

            snapshot.forEach(function (snapshotChild) {
                resolve(snapshotChild.key(), snapshotChild.val(), function (val) {
                    var key = snapshotChild.key();

                    val._key = key;

                    this.items.push({
                        val: val,
                        key: key
                    });

                    i += 1;

                    if (i === snapshot.numChildren()) {
                        this.prepareAndSetState({items: this.items, loaded: true});
                        monitorRef.bind(this)();
                    };
                }.bind(this));
            }.bind(this));
        }.bind(this));

    },
    prepareAndSetState: function (state) {
        this.sortItems(); // in place
        state.items = this.filterItems(); // not in place
        this.setState(state);
        this.props.itemsLoaded(this.state.items);
    },
    processSnapshot: function (snapshot) {
        var resolve = configuration.refs[this.props.refIndex].resolve || defaultResolve;

        resolve(snapshot.key(), snapshot.val(), function (val) {
            var key = snapshot.key();

            var existingIndex = _.findIndex(this.items, {'key': key});

            val._key = key;

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
        var existingIndex = _.findIndex(this.items, {'key': key});

        this.items.splice(existingIndex, 1);
        this.setState({
            items: this.items
        });
    },
    componentWillUnmount: function () {
        configuration.refs[this.props.refIndex].ref.off();
    },
    handleFilterChange: function (key, title, event) {
        const value = event.target.value.replace(title + ': ', '').replace(title + ':', '');

        if (this.filterDebounced) {
            this.filterDebounced.cancel();
        };

        var filtersByKey = this.state.filtersByKey;
        if (value != '') {
            filtersByKey[key] = title + ': ' + value;
        } else {
            delete filtersByKey[key];
        };

        this.setState({
            filtersByKey: filtersByKey
        });

        this.filterDebounced = _.debounce(this.registerFilterAndRun, 250, {maxWait: 1000});

        this.filterDebounced(key, value);
    },
    registerFilterAndRun: function (key, value) {
        if (value) {
            this.filters[key] = function(val){
                return function (o) {
                    var queriedValue = getNestedValue(o.val, key);

                    if (queriedValue.toString().toLowerCase().indexOf(val.toLowerCase()) > -1) {
                        return true
                    } else if (queriedValue.toString().score(val) > 0.4) {
                        return true
                    } else {
                        return false
                    }
                }
            }(value);

        } else {
            delete this.filters[key];
        };

        var items = this.filterItems();

        this.setState({
            items: items,
        });

        this.props.itemsFiltered(items);
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
    handleSearchClick: function (key, event) {
        var openFilterFields = this.state.openFilterFields;
        if (openFilterFields.indexOf(key) > -1) {
            delete openFilterFields[openFilterFields.indexOf(key)];
        } else {
            openFilterFields.push(key);
        }

        this.setState({
            openFilterFields: openFilterFields
        });
    },
    handleSearchSubmit: function (key, event) {
        event.preventDefault();

        var openFilterFields = this.state.openFilterFields;
        delete openFilterFields[openFilterFields.indexOf(key)];

        this.setState({
            openFilterFields: openFilterFields
        });
    },
    // Filters this.items and returns filtered
    filterItems: function () {
        var items = this.items;

        for (var k in this.filters) {
            items = _.filter(items, this.filters[k]);
        }

        return items;
    },
    // Sorts in place
    sortItems: function () {
        if (this.currentOrderBy) {
            this.items = _.orderBy(this.items, function (item) {
                return getNestedValue(item.val, this.currentOrderBy);
            }.bind(this), this.currentOrderByDirection);
        };
    },
    // Should probably be another component
    renderHeaders: function () {
        var refConfiguration = configuration.refs[this.props.refIndex].children;

        // Create table headers
        var headers = [];
        for (var i = 0; i < refConfiguration.length; i++) {
            var config = refConfiguration[i];
            var title = config.title || config.key;
            var key = config.key;

            var headerArrowClass = '';

            if (this.currentOrderBy === key) {
                if (this.currentOrderByDirection === 'asc') {
                    headerArrowClass = 'Arrow isAsc'
                } else {
                    headerArrowClass = 'Arrow isDesc'
                }
            };

            var headerLabel = null;
            var headerLabelClass = "";
            var headerSortArrow = null;
            var filterInput = null;
            var searchGlyph = null;

            if (config.canFilter !== false) {
                if (this.filters[key] !== undefined) {
                    searchGlyph = (<span className="HeaderSearchIcon" onClick={this.handleSearchClick.bind(this, key)}>
                        <Glyph icon="search" type="primary"></Glyph>
                    </span>)
                    headerLabelClass = "HeaderLabel isPrimary"
                } else {
                    searchGlyph = (<span className="HeaderSearchIcon" onClick={this.handleSearchClick.bind(this, key)}>
                        <Glyph icon="search"></Glyph>
                    </span>)
                }
            }

            if (this.state.openFilterFields.indexOf(key) > -1) {
                filterInput = <Form className="HeaderSearch" onSubmit={this.handleSearchSubmit.bind(this, key)}>
                    <FormInput
                        autofocus
                        className="HeaderSearch"
                        type="text"
                        placeholder="Filter"
                        value={this.state.filtersByKey[key] || title + ': '}
                        onChange={this.handleFilterChange.bind(this, key, title)
                        }
                    ></FormInput>
                </Form>
            } else {
                headerLabel = <span className={headerLabelClass} onClick={this.handleSortClick.bind(null, key)}>{this.state.filtersByKey[key] || title}</span>
                headerSortArrow = <span className={headerArrowClass} />
            };

            headers.push(
                <th key={i} className='SortableHeader' width={config.width}>
                    <div>
                        {searchGlyph}
                        {filterInput}
                        {headerLabel}
                        {headerSortArrow}
                    </div>
                </th>
            );
        };

        return headers
    },
    render: function () {

        if (!this.state.loaded) {
            return (
                <div style={{width: "100%", height: "800px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Spinner size="lg" />
                </div>
            )
        }

        var headers = this.renderHeaders();

        // Dynamically create rows based on ref configuration
        var rows = [];

        var rangeStart = this.props.rangeStart;
        var rangeEnd = this.props.rangeEnd;
        var rangeDiff = rangeEnd - rangeStart;

        if (this.state.items.length < rangeEnd) {
            rangeEnd = this.state.items.length;
        }

        if (this.state.items.length >= rangeStart && rangeEnd >= rangeStart) {
            for (var i = rangeStart - 1; i < rangeEnd; i++) {
                var key = this.state.items[i].key;
                var val = this.state.items[i].val;
                rows.push(<Row key={key} item={val} itemKey={key} refIndex={this.props.refIndex} />);
            };
        }

        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            {/* Spacer */}
                            <th>
                            </th>
                            {headers}
                            {/* Save Button */}
                            <th></th>
                            {/* Spacer */}
                            <th>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </div>
        );
    }
});
