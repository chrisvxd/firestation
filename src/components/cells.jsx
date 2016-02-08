import React from 'react';
import ReactDOM from 'react-dom';
var moment = require('moment');

export var TextCell = React.createClass({
    render: function () {
        return (
            <div>{this.props.value}</div>
        );
    }
});

export var ImageCell = React.createClass({
    render: function () {
        return (
            <img
                src={this.props.value}
                width={this.props.extras.width}
                height={this.props.extras.height}>
            </img>
        );
    }
});

export var SelectCell = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value
        }
    },
    handleChange: function (event) {
        this.setState({
            value: event.target.value
        });
        this.props.valueChanged(this.props.childKey, event.target.value);
    },
    render: function () {
        var optionConfig = this.props.extras.options;
        var options = [];

        for (var i = 0; i < optionConfig.length; i++) {
            var option = optionConfig[i];
            options.push(
                <option key={i} value={option.value}>{option.title}</option>
            );
        };

        return (
            <select value={this.state.value} onChange={this.handleChange}>
                {options}
            </select>
        );
    }
});

export var DateCell = React.createClass({
    componentWillMount: function () {
        this.moment = moment(this.props.value).format("DD/MM/YY, h:mm:ss a");
    },
    render: function () {
        return (
            <div>{this.moment}</div>
        );
    }
});

export var TimeSinceCell = React.createClass({
    componentWillMount: function () {
        this.moment = moment(this.props.value).fromNow()
    },
    render: function () {
        return (
            <div>{this.moment}</div>
        );
    }
});

export var CurrencyCell = React.createClass({
    render: function () {
        return (
            <div>{this.props.extras.symbol}{this.props.value}</div>
        );
    }
});
