require('./cells.css');

import React from 'react';
import ReactDOM from 'react-dom';
var moment = require('moment');
var elemental = require('elemental');
var Button = elemental.Button;
var Form = elemental.Form;
var FormInput = elemental.FormInput;
var Glyph = elemental.Glyph;
var Checkbox = elemental.Checkbox;
var Datetime = require('react-datetime');
var Dropdown = elemental.Dropdown;

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

        if (this.props.clean) {
            this.state.value = this.props.value;
        }

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

        if (this.props.clean) {
            this.state.value = this.props.value;
        }

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

        if (this.props.clean) {
            this.state.value = this.props.value;
        }

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

export var BooleanCell = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value
        }
    },
    handleChange: function (value) {
        this.setState({
            value: value
        });
        this.props.valueChanged(this.props.childKey, value);
    },
    handleChecked: function (event) {
        this.handleChange(true);
    },
    handleUnchecked: function (event) {
        this.handleChange(false);
    },
    render: function () {
        var optionConfig = ((this.props.extras || {}).options || {});

        if (this.props.clean) {
            this.state.value = this.props.value;
        }

        if (this.state.value === true) {
            return (
                <span>
                    <Checkbox label={optionConfig.label || ""} className='CellContent' checked onChange={this.handleUnchecked}  disabled={!this.props.canWrite}/>
                </span>
            )
        } else {
            return (
                <span>
                    <Checkbox label={optionConfig.label || ""} className='CellContent' onChange={this.handleChecked}  disabled={!this.props.canWrite}/>
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

        if (this.props.clean) {
            this.state.value = this.props.value;
        }

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
    // The following three methods are lifted from Datetime picker module https://github.com/YouCanBookMe/react-datetime/
    localMoment: function( date, format ){
        const extras = this.props.extras || {};

        var strictParsing = extras.strictParsing;

        if (strictParsing === undefined) {
            strictParsing = false
        }

        var m = moment( date, format, strictParsing );
        if ( extras.locale )
            m.locale( extras.locale );
        return m;
    },
    getUpdateOn: function(formats){
        if ( formats.date.match(/[lLD]/) ){
            return 'days';
        }
        else if ( formats.date.indexOf('M') !== -1 ){
            return 'months';
        }
        else if ( formats.date.indexOf('Y') !== -1 ){
            return 'years';
        }

        return 'days';
    },
    getFormats: function(){
        const extras = this.props.extras || {};

        var formats = {
                date: extras.dateFormat || '',
                time: extras.timeFormat || ''
            },
            locale = this.localMoment( this.props.value ).localeData()
        ;

        if ( formats.date === true ){
            formats.date = locale.longDateFormat('L');
        } else if ( this.getUpdateOn(formats) !== 'days' ){
            formats.time = '';
        }

        if ( formats.time === true ){
            formats.time = locale.longDateFormat('LT');
        }

        formats.datetime = formats.date && formats.time ?
            formats.date + ' ' + formats.time :
            formats.date || formats.time
        ;

        return formats;
    },
    getMoment: function () {
        if (this.state.value !== undefined && this.state.value !== "") {
            return moment(this.state.value).format(this.getFormats().datetime || "DD/MM/YY, h:mm:ss a");
        } else {
            return ""
        }
    },
    getInitialState: function() {
        return {
            editing: false,
            value: this.props.value
        }
    },
    handleEditToggle: function (event) {
        event.preventDefault();
        this.setState({
            editing: !this.state.editing
        });
    },
    handleChange: function (moment) {
        var value;
        var type;

        // Ensure we stick with the format, whether ISO or milliseconds
        if (this.props.extras.saveFormat !== undefined) {
            type = this.props.extras.saveFormat;
        } else {
            if (typeof this.props.value === "number") {
                type = "numeric"
            } else {
                type = "iso"
            }
        }

        if (type === "numeric") {
            value = moment.toDate().getTime();
        } else {
            value = moment.toDate().toISOString();
        }

        this.props.valueChanged(this.props.childKey, value);

        this.setState({value: value});
    },
    render: function () {
        var editGlyph;

        if (this.props.canWrite) {
            editGlyph = (<span onClick={this.handleEditToggle} className='CellEditIcon'>
                <Glyph icon='pencil'></Glyph>
            </span>)
        };

        if (!this.state.editing) {
            return <div>
                {this.getMoment()} {editGlyph}
            </div>
        } else {
            return <div><Datetime
                value={new Date(this.state.value)}
                dateFormat={this.getFormats().date || "DD/MM/YY"}
                timeFormat={this.getFormats().time || "h:mm:ss a"}
                onChange={this.handleChange}/>
                {editGlyph}
            </div>
        }
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

export var ButtonCell = React.createClass({
    getInitialState: function () {
        return {
            disabled: this.props.extras.disabled || false,
            title: this.props.extras.title,
            type: this.props.extras.type || 'primary'
        }
    },
    action: function () {
        var $this = this;
        this.props.extras.action(this.props.rowKey, this.props.rowValue, function (newProps) {
            $this.setState(newProps || {});
        });
    },
    render: function () {
        return <Button onClick={this.action} disabled={this.state.disabled} type={this.state.type}>{this.state.title}</Button>
    }
});

export var DropdownCell = React.createClass({
    getInitialState: function () {
        return {
            title: this.props.extras.title || '',
            items: this.props.extras.items || []
        }
    },
    onSelect: function (index) {
        var action = this.state.items[index].action;

        if (action !== undefined) {
            var $this = this;
            this.state.items[index].action(this.props.rowKey, this.props.rowValue);
        }
    },
    render: function () {
        // Map item values to index so we can use inline methods when defining
        for (var i = 0; i < this.state.items.length; i++) {
            this.state.items[i].value = i
        }

        return (
            <Dropdown
                items={this.state.items}
                onSelect={this.onSelect}
                buttonLabel={this.state.title}
            />
        );
    }
});
