/*global window, Notification*/
var _ = require('underscore');
var ChatLine = require('./ChatLine.jsx');
var ChatMessage = require('./ChatMessage.jsx');
var messageListener = require('../actions/messageListener');
var MessagesStore = require('../stores/MessagesStore');
var React = require('react/addons');
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
    if (this.MessagesStore.lastID() === 0) {
      this.props.context.executeAction(showChat);
    }
    this.props.context.executeAction(messageListener.startListening);
    if (Notification) {
      Notification.requestPermission(function () {
        this._notification = true;
        window.addEventListener('blur', this.blur);
        window.addEventListener('focus', this.focus);
      }.bind(this));
    }
  },

  componentWillUnmount: function() {
    this.MessagesStore.removeChangeListener(this._onChange);
    this.props.context.executeAction(messageListener.stopListening);
    window.removeEventListener('blur', this.blur);
    window.removeEventListener('focus', this.focus);
  },

  blur: function () {
    this._blur = true;
  },

  focus: function () {
    this._blur = false;
    if (this._note) {
      this._note.close();
      this._note = null;
    }
  },

  componentWillUpdate: function (nextProps, nextState) {
    // Poor mans new message
    if (this._notification && this._blur) {
      var oldLastMessage = _.clone(this.state.messages).pop();
      var oldLastMessageId = parseInt(oldLastMessage.id, 10);
      var newLastMessage = _.clone(nextState.messages).pop();
      var newLastMessageId = parseInt(newLastMessage.id, 10);
      if (oldLastMessageId !== newLastMessageId) {
        this._note = new Notification('New message');
        this._blur = false; // Prevent further messages
      }
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());
  },

  render: function render () {
    var messages = this.state.messages.map(function (message) {
      return <ChatMessage key={message.id} message={message} />;
    });
    if (messages.length === 0) {
      messages = <div>Loading…</div>;
    }
    return (<div className="chatWindow">
      <ul className="messages">
        {messages}
      </ul>
      <ChatLine context={this.props.context} />
    </div>);
  },
});
