/*global window*/
var _ = require('underscore');
var messageSend = require('../actions/messageSend');
var React = require('react/addons');

module.exports = React.createClass({
  getInitialState: function getInitialState () {
    this.MessagesStore = this.props.context.getStore('MessagesStore');
    var state = this.getStateFromStores();
    state.message = '';
    return state;
  },

  componentDidMount: function() {
    this.MessagesStore.addChangeListener(this._OnStoreChange);
    this.focus();
    window.addEventListener('focus', this.focus);
  },

  componentWillUnmount: function() {
    this.MessagesStore.removeChangeListener(this._OnStoreChange);
    window.removeEventListener('focus', this.focus);
  },

  _OnStoreChange: function _OnStoreChange () {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores: function getStateFromStores () {
    var oldStatus = this.state && this.state.sendStatus;
    var state = {
      sendStatus: this.MessagesStore.getSendStatus(),
    };
    if (oldStatus === 'progress') {
      if (state.sendStatus === 'success') {
        state.message = '';
      }

      if (state.sendStatus !== 'progress') {
        this.focus();
      }
    }
    return state;
  },

  focus: function () {
    if (this.refs.input) {
      var node = this.refs.input.getDOMNode();
      _.defer(function () {
        node.focus();
      });
    }
  },

  _onInputChange: function _onInputChange (e) {
    this.setState({ message: e.target.value });
  },

  _onSubmit: function _onSubmit (e) {
    e.preventDefault();
    this.props.context.executeAction(messageSend,
                                     _.pick(this.state, 'message'));
  },

  render: function render () {
    return (<form onSubmit={this._onSubmit} className="chatLine">
      <input
        ref="input"
        autoFocus
        disabled={this.state.sendStatus === 'progress'}
        type="text"
        value={this.state.message}
        style={{width: '100%'}} // TODO: Replace
        onChange={this._onInputChange} />
    </form>);
  },
});
