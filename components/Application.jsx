/** @jsx React.DOM */

var Chat = require('./Chat.jsx');
var Online = require('./Online.jsx');
var React = require('react/addons');
var RouterMixin = require('flux-router-component').RouterMixin;

module.exports = React.createClass({
  mixins: [RouterMixin],

  getInitialState: function getInitialState () {
    this.store = this.props.context.getStore('ApplicationStore');
    return this.store.getState();
  },

  componentDidMount: function componentDidMount () {
    this._changeEventListener = function () {
      var state = this.store.getState();
      this.setState(state);
    }.bind(this);
    this.store.on('change', this._changeEventListener);
  },

  componentWillUnmount: function componentWillUnmount () {
    this.store.removeListener('change', this._changeEventListener);
    this._changeEventListener = null;
  },

  render: function render () {
    switch (this.state.currentPageName) {
      case 'online':
        return <Online context={this.props.context} />;
      default:
        return <Chat context={this.props.context} />;
    }
  },
});
