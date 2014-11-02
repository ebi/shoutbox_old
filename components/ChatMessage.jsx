var React = require('react/addons');
var moment = require('moment');

module.exports = React.createClass({
  props: {
      message: React.PropTypes.object,
  },

  render: function render () {
    var message = this.props.message;
    var time = moment.utc(message.time).local();

    return (<li>
      <span title={time.format()}>{time.format('HH:mm')} </span>
      {message.username} - {message.message}
    </li>);
  },
});
