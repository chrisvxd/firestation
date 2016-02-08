import React from 'react';
import ReactDOM from 'react-dom';

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
