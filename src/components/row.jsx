import React from 'react';
import ReactDOM from 'react-dom';

var elemental = require('elemental');
var Button = elemental.Button;

import configuration from '../../firestation.config.js';
import {getNestedValue, setNestedValue, getNestedRef} from '../utils.js';

import './cells.jsx';

export default React.createClass({
    getInitialState: function () {
        return {
            changed: false
        }
    },
    componentWillMount: function () {
        this.deltaVal = {};
    },
    save: function () {
        console.log('Saving', this.props.itemKey);

        var key = this.props.itemKey;

        const config = configuration.refs[this.props.refIndex];
        var rootRef = (config.batchRef || config.ref || config.getRef()).ref();

        var ref = rootRef.child(key);

        // Update each modified key individually, since need to account for nested keys
        for (var key in this.deltaVal) {
            var childRef = getNestedRef(ref, key);
            childRef.set(this.deltaVal[key]);
        };

        this.deltaVal = {};

        this.setState({
            changed: false
        });
    },
    saveClick: function () {
        this.save();
    },
    valueChanged: function (key, value) {
        this.deltaVal[key] = value;
        this.setState({
            changed: true
        });
    },
    render: function () {
        var refConfiguration = configuration.refs[this.props.refIndex].children;
        var columns = [];

        for (var i = 0; i < refConfiguration.length; i++) {
            var config = refConfiguration[i];
            var KeyCell = config.cell;

            // get nested keys
            var value = getNestedValue(this.props.item, config.key);

            columns.push(
                <td key={i} >
                    <KeyCell
                        clean={!this.state.changed}
                        rowValue={this.props.item}
                        rowKey={this.props.itemKey}
                        value={value}
                        childKey={config.key}
                        valueChanged={this.valueChanged}
                        canWrite={config.canWrite || false}
                        extras={config.cellProps} />
                </td>
            );
        };

        return (
            <tr>
                <td>
                </td>
                {columns}
                <td>
                    <Button type="primary" onClick={this.saveClick} disabled={!this.state.changed}>Save</Button>
                </td>
                <td>
                </td>
            </tr>
        );
    }
});
