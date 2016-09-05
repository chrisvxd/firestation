import React from 'react';
import ReactDOM from 'react-dom';

import configuration from '../firestation.config.js';

import 'elemental/less/elemental.less';

var elemental = require('elemental');

var GridRow = elemental.Row;
var GridCol = elemental.Col;
var Card = elemental.Card;
var Form = elemental.Form;
var FormField = elemental.FormField;
var FormInput = elemental.FormInput;
var Spinner = elemental.Spinner;

import FirebaseTable from 'components/firebase-table.jsx';

import {getNestedValue, setNestedValue} from './utils.js';

var defaultResolve = function (key, val, callback) {
    callback(val);
};

export default React.createClass({
    componentWillMount: function () {
        this.items = {};
        this.layouts = {};
        this.handlers = {};
        this.refs = {};
        this.refSelected(0);
    },
    getInitialState: function () {
        document.title = configuration.title + ' | ' + configuration.refs[0].title;
        return {
            currentRefIndex: 0,
            currentItems: [],
            currentHandlers: {},
            rangeStart: configuration.refs[0].rangeStart || 1,
            rangeEnd: configuration.refs[0].rangeEnd || 10,
            filteredSize: 0,
            loaded: false
        };
    },
    refSelected: function (refIndex) {
        document.title = configuration.title + ' | ' + configuration.refs[refIndex].title;
        this.setState({
            currentRefIndex: refIndex,
            currentItems: [],
            rangeStart: configuration.refs[refIndex].rangeStart || 1,
            rangeEnd: configuration.refs[refIndex].rangeEnd || 10
        });

        if (this.items[refIndex] === undefined) {
            this.setState({loaded: false});
            this.layouts[refIndex] = {filters: {}};
            this.makeQuery(refIndex);
        } else {
            this.prepareAndSetState(refIndex);
        }
    },
    makeQuery: function (refIndex) {
        this.items[refIndex] = [];

        const config = configuration.refs[refIndex];

        const ref = (config.getRef || function () {return config.ref})();
        const batchRef = config.batchRef || ref;

        var _this = this;

        var monitorRef = function () {
            ref.on('child_added', function (snapshot) {this.processSnapshot(refIndex, snapshot)}.bind(this)),
            batchRef.on('child_changed', function (snapshot) {this.processSnapshot(refIndex, snapshot)}.bind(this)),
            batchRef.on('child_removed', function (snapshot) {this.removeSnapshot(refIndex, snapshot)}.bind(this))
        };

        // Run value once, then watch for children added
        batchRef.once('value', function (snapshot) {
            var i = 0;

            console.log('Queried firebase!');

            var resolve = configuration.refs[refIndex].resolve || defaultResolve;

            snapshot.forEach(function (snapshotChild) {
                resolve(snapshotChild.key(), snapshotChild.val(), function (val) {
                    var key = snapshotChild.key();

                    val._key = key;

                    this.items[refIndex].push({
                        val: val,
                        key: key
                    });

                    i += 1;

                    if (i === snapshot.numChildren()) {
                        this.prepareAndSetState(refIndex);
                        monitorRef.bind(this)();
                    };
                }.bind(this));
            }.bind(this));
        }.bind(this));

    },
    processSnapshot: function (refIndex, snapshot) {
        var resolve = configuration.refs[refIndex].resolve || defaultResolve;

        resolve(snapshot.key(), snapshot.val(), function (val) {
            var key = snapshot.key();

            var existingIndex = _.findIndex(this.items[refIndex], {'key': key});

            val._key = key;

            var newItem = {
                val: val,
                key: key
            };

            if (existingIndex > -1) {
                if (JSON.stringify(this.items[refIndex][existingIndex]) !== JSON.stringify(newItem)) {
                    this.items[refIndex][existingIndex] = newItem
                    this.setStateIfRefActive(refIndex);
                }
            } else {
                this.items[refIndex].push(newItem);
                this.setStateIfRefActive(refIndex);
            };
        }.bind(this));
    },
    removeSnapshot: function (refIndex, snapshot) {
        var key = snapshot.key();
        var existingIndex = _.findIndex(this.items[refIndex], {'key': key});

        this.items[refIndex].splice(existingIndex, 1);

        this.setStateIfRefActive(refIndex);
    },
    setStateIfRefActive: function (refIndex) {
        if (refIndex === this.state.currentRefIndex) {
            this.prepareAndSetState(refIndex)
        }
    },
    prepareAndSetState: function (refIndex) {
        this.sortItems(refIndex); // in place
        this.setState({
            currentItems: this.filterItems(refIndex),
            filteredSize: this.items[refIndex].length,
            loaded: true
        });
    },
    // Filters this.items and returns filtered
    filterItems: function (refIndex) {
        var items = this.items[refIndex];

        for (var k in this.layouts[refIndex].filters) {
            items = _.filter(items, this.layouts[refIndex].filters[k]);
        }

        return items;
    },
    // Sorts in place
    sortItems: function (refIndex) {
        if (this.layouts[refIndex].orderBy) {
            this.items[refIndex] = _.orderBy(this.items[refIndex], function (item) {
                return getNestedValue(item.val, this.layouts[refIndex].orderBy);
            }.bind(this), this.layouts[refIndex].orderByDirection);
        };
    },
    setCurrentOrderBy: function (orderBy, direction) {
        this.layouts[this.state.currentRefIndex].orderBy = orderBy
        this.layouts[this.state.currentRefIndex].orderByDirection = direction
        this.prepareAndSetState(this.state.currentRefIndex);
    },
    setFiltersByKey: function (filtersByKey) {
        this.layouts[this.state.currentRefIndex].filtersByKey = filtersByKey
    },
    setOpenFilterFields: function (openFilterFields) {
        this.layouts[this.state.currentRefIndex].openFilterFields = openFilterFields
    },
    itemsLoaded: function (items) {
        this.setState({
            currentItems: items,
            filteredSize: items.length
        });
    },
    itemsFiltered: function (items) {
        this.setState({
            filteredSize: items.length
        });
    },
    setCurrentHandlers: function (handlers) {
        this.setState({
            currentHandlers: handlers
        });
    },
    registerFilterAndRun: function (key, value) {
        if (value) {
            this.layouts[this.state.currentRefIndex].filters[key] = function(val){
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
            delete this.layouts[this.state.currentRefIndex].filters[key];
        };

        var items = this.filterItems(this.state.currentRefIndex);

        this.layouts[this.state.currentRefIndex].items = items;

        this.setState({
            currentItems: items,
            filteredSize: items.length
        });
    },
    updateBackgroundItems: function (items) {

    },
    handleRangeStartChange: function (event) {
        var rangeDiff = this.state.rangeEnd - this.state.rangeStart;

        var value = Number(event.target.value);

        if (value < 1) {
            value = 1;
        };

        this.setState({
            rangeStart: value,
            rangeEnd: value + Number(rangeDiff)
        });
    },
    handleRangeEndChange: function (event) {
        var value = Number(event.target.value);
        if (value < 1) {
            value = 1;
        }

        var rangeStart = this.state.rangeStart;

        if (this.state.rangeStart > this.state.rangeEnd) {
            rangeStart = this.state.rangeEnd
        }

        this.setState({
            rangeStart: rangeStart,
            rangeEnd: value
        });
    },
    render: function() {
        var refOptions = [];

        for (var i = 0; i < configuration.refs.length; i++) {
            if (this.state.currentRefIndex === i) {
                refOptions.push(
                    <div className="NavItem isActive" key={i} onClick={this.refSelected.bind(this, i)}>{configuration.refs[i].title}</div>
                );
            } else {
                refOptions.push(
                    <div className="NavItem" key={i} onClick={this.refSelected.bind(this, i)}>{configuration.refs[i].title}</div>
                );
            }
        };

        var table;

        if (!this.state.loaded) {
            table = (<div style={{width: "100%", height: "800px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                 <Spinner size="lg" />
             </div>)
        } else {
            table = <FirebaseTable
                key={this.state.currentRefIndex}
                refIndex={this.state.currentRefIndex}
                rangeStart={this.state.rangeStart}
                rangeEnd={this.state.rangeEnd}
                items={this.state.currentItems}
                itemsLoaded={this.itemsLoaded}
                itemsFiltered={this.itemsFiltered}
                setCurrentOrderBy={this.setCurrentOrderBy}
                setOpenFilterFields={this.setOpenFilterFields}
                setFiltersByKey={this.setFiltersByKey}
                orderBy={this.layouts[this.state.currentRefIndex].orderBy}
                orderByDirection={this.layouts[this.state.currentRefIndex].orderByDirection}
                openFilterFields={this.layouts[this.state.currentRefIndex].openFilterFields}
                filtersByKey={this.layouts[this.state.currentRefIndex].filtersByKey}
                registerFilterAndRun={this.registerFilterAndRun}
            />
        }

        return (
            <div>
                <div className="Nav">
                    <span className="Heading">{configuration.title}</span>

                    <div className="NavItems">
                        {refOptions}
                    </div>

                    <Form type="inline">
                        <FormField>
                            <FormInput type="number" value={this.state.rangeStart} onChange={this.handleRangeStartChange}>
                            </FormInput>
                        </FormField>
                        to
                        <FormField>
                            <FormInput type="number" value={this.state.rangeEnd} onChange={this.handleRangeEndChange}>
                            </FormInput>
                        </FormField>
                        of&nbsp;{this.state.filteredSize || '...'}
                    </Form>
                </div>

                {table}
            </div>
        )
    }
});
