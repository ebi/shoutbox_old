/** @jsx React.DOM */
var React = require('react/addons');

module.exports = React.createClass({
  props: {
      message: React.PropTypes.object,
  },

  render: function render () {
    var message = this.props.message;

    return <li>{message.message}</li>;
  },
});
