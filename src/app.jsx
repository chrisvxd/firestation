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

import FirebaseTable from 'components/firebase-table.jsx';

export default React.createClass({
    getInitialState: function () {
        document.title = configuration.title + ' | ' + configuration.refs[0].title;
        return {
            currentRefIndex: 0,
            currentItems: [],
            rangeStart: configuration.refs[0].rangeStart || 1,
            rangeEnd: configuration.refs[0].rangeEnd || 10,
            filteredSize: 0
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

        return (
            <div>
                <div className="Nav">
                    <h2>{configuration.title}</h2>

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

                <FirebaseTable
                    key={this.state.currentRefIndex}
                    refIndex={this.state.currentRefIndex}
                    rangeStart={this.state.rangeStart}
                    rangeEnd={this.state.rangeEnd}
                    itemsLoaded={this.itemsLoaded}
                    itemsFiltered={this.itemsFiltered}
                />
            </div>
        )
    }
});
