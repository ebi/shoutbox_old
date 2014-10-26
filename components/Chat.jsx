/** @jsx React.DOM */
var React = require('react/addons');
var MessagesStore = require('../stores/MessagesStore');
var showChat = require('../actions/showChat');

module.exports = React.createClass({
  getInitialState: function getInitialState () {
    var context = this.props.context;
    this.MessagesStore = context.getStore(MessagesStore);
    return this.getStateFromStores();
  },

  getStateFromStores: function () {
    return {
      messages: this.MessagesStore.getAllMessages(),
    };
  },

  componentDidMount: function() {
    this.MessagesStore.addChangeListener(this._onChange);
    this.props.context.executeAction(showChat);
  },

  componentWillUnmount: function() {
    this.MessagesStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());
  },

  render: function render () {
    return <h1>Chat</h1>;
  },
});
