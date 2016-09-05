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

export default React.createClass({
    getInitialState: function () {
        return {
            items: [],
            orderBy: this.props.orderBy,
            orderByDirection: this.props.orderByDirection,
            openFilterFields: this.props.openFilterFields || [],
            filtersByKey: this.props.filtersByKey || {},
            loaded: true
        };
    },
    componentWillMount: function() {
        const config = configuration.refs[this.props.refIndex];

        this.currentOrderBy = (this.props.orderBy || configuration.refs[this.props.refIndex].orderBy);
        this.currentOrderByDirection = (this.props.orderByDirection || configuration.refs[this.props.refIndex].orderByDirection);
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

        this.filterDebounced = _.debounce(this.props.registerFilterAndRun, 250, {maxWait: 1000});

        this.filterDebounced(key, value);

        this.props.setFiltersByKey(filtersByKey);
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

        this.setState({
            orderBy: this.currentOrderBy,
            orderByDirection: this.currentOrderByDirection
        });

        this.props.setCurrentOrderBy(this.currentOrderBy, this.currentOrderByDirection)
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

        this.props.setOpenFilterFields(openFilterFields);
    },
    handleSearchSubmit: function (key, event) {
        event.preventDefault();

        var openFilterFields = this.state.openFilterFields;
        delete openFilterFields[openFilterFields.indexOf(key)];

        this.setState({
            openFilterFields: openFilterFields
        });
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
                if (this.state.filtersByKey[key] !== undefined) {
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

        var headers = this.renderHeaders();

        // Dynamically create rows based on ref configuration
        var rows = [];

        var rangeStart = this.props.rangeStart;
        var rangeEnd = this.props.rangeEnd;
        var rangeDiff = rangeEnd - rangeStart;

        if (this.props.items.length < rangeEnd) {
            rangeEnd = this.props.items.length;
        }

        if (this.props.items.length >= rangeStart && rangeEnd >= rangeStart) {
            for (var i = rangeStart - 1; i < rangeEnd; i++) {
                var key = this.props.items[i].key;
                var val = this.props.items[i].val;
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
