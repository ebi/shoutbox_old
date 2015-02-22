var Autolinker = require('autolinker');
var React = require('react/addons');
var moment = require('moment');

module.exports = React.createClass({
  props: {
      message: React.PropTypes.object,
  },

  componentDidMount: function () {
    this.getDOMNode().scrollIntoView(false);
  },

  render: function render () {
    var message = this.props.message;
    var time = moment.utc(message.time).local();
    var msg = Autolinker.link(message.message, {
      twitter: false,
    });

    return (<li>
      <span title={time.format()}>{time.format('HH:mm')} </span>
      {message.username} - <span dangerouslySetInnerHTML={{__html: msg}} />
    </li>);
  },
});
