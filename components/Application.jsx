/** @jsx React.DOM */
var React = require('react/addons');
var RouterMixin = require('flux-router-component').RouterMixin;

var Application = React.createClass({
  mixins: [RouterMixin],

  render: function () {
    return (
      <h1>Hello World</h1>
    );
  }
});

module.exports = Application;
