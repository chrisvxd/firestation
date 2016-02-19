import React from 'react';
import ReactDOM from 'react-dom';
var moment = require('moment');
var elemental = require('elemental');
var Form = elemental.Form;
var FormInput = elemental.FormInput;
var Glyph = elemental.Glyph;

export var TextCell = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value,
            editing: false
        }
    },
    handleChange: function (event) {
        this.setState({
            value: event.target.value
        });
        this.props.valueChanged(this.props.childKey, event.target.value);
    },
    handleEditToggle: function (event) {
        event.preventDefault();
        this.setState({
            editing: !this.state.editing
        });
    },
    render: function () {
        var editGlyph = null;

        if (this.props.canWrite) {
            editGlyph = (<span onClick={this.handleEditToggle} className='CellEditIcon'>
                <Glyph icon='pencil'></Glyph>
            </span>)
        };

        if (this.props.canWrite && this.state.editing === true) {
            // Read and write
            return (
                <span>
                    <Form onSubmit={this.handleEditToggle}>
                        <FormInput autofocus className='CellContent' type="text" value={this.state.value} onChange={this.handleChange}></FormInput>
                        {editGlyph}
                    </Form>
                </span>
            )
        } else {
            // Read only
            return (
                <span>
                    <span className='CellContent'>{this.state.value}</span>
                    {editGlyph}
                </span>
            )
        }
    }
});

export var LongTextCell = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value,
            editing: false
        }
    },
    handleChange: function (event) {
        this.setState({
            value: event.target.value
        });
        this.props.valueChanged(this.props.childKey, event.target.value);
    },
    handleEditToggle: function (event) {
        event.preventDefault();
        this.setState({
            editing: !this.state.editing
        });
    },
    render: function () {
        var editGlyph = null;

        if (this.props.canWrite) {
            editGlyph = (<span onClick={this.handleEditToggle} className='CellEditIcon'>
                <Glyph icon='pencil'></Glyph>
            </span>)
        };

        if (this.props.canWrite && this.state.editing === true) {
            // Read and write
            return (
                <span>
                    <Form onSubmit={this.handleEditToggle}>
                        <FormInput autofocus multiline className='CellContent' type="textarea" value={this.state.value} onChange={this.handleChange}></FormInput>
                        {editGlyph}
                    </Form>
                </span>
            )
        } else {
            // Read only
            return (
                <span>
                    <FormInput multiline className='CellContent ReadOnlyTextArea' type="textarea" value={this.state.value} readOnly={!this.state.editing}></FormInput>
                    {editGlyph}
                </span>
            )
        }
    }
});


export var NumberCell = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value,
            editing: false
        }
    },
    handleChange: function (event) {
        this.setState({
            value: event.target.value
        });
        this.props.valueChanged(this.props.childKey, Number(event.target.value));
    },
    handleEditToggle: function (event) {
        event.preventDefault();
        this.setState({
            editing: !this.state.editing
        });
    },
    render: function () {
        var editGlyph = null;

        if (this.props.canWrite) {
            editGlyph = (<span onClick={this.handleEditToggle} className='CellEditIcon'>
                <Glyph icon='pencil'></Glyph>
            </span>)
        };

        if (this.props.canWrite && this.state.editing === true) {
            // Read and write
            return (
                <span>
                    <Form onSubmit={this.handleEditToggle}>
                        <FormInput autofocus className='CellContent' type="number" value={this.state.value} onChange={this.handleChange}></FormInput>
                        {editGlyph}
                    </Form>
                </span>
            )
        } else {
            // Read only
            return (
                <span>
                    <span className='CellContent'>{this.state.value}</span>
                    {editGlyph}
                </span>
            )
        }
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
        return {}
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
            <select value={this.state.value || this.props.value} onChange={this.handleChange} disabled={!this.props.canWrite}>
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
        this.startMomentTicker();
    },
    getInitialState: function () {
        return {
            moment: moment(this.props.value).fromNow()
        }
    },
    startMomentTicker: function () {
        this.ticker = setInterval(function() {
            this.setState({
                moment: moment(this.props.value).fromNow()
            });
        }.bind(this), 1000);
    },
    componentWillUnmount: function () {
        clearInterval(this.ticker);
    },
    render: function () {
        return (
            <div>{this.state.moment}</div>
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
