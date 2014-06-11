//var React = require('react')
var superagent = require('superagent')

var titleMixin = function(t) {
  return {
    componentDidMount: function() {
      console.log("hello "+t)
    }
  }
}

function ES() {
  this.conn = new EventSource("http://localhost:9000/streamEvent", {withCredentials: true});
  this.send = function(msg) {
    console.log("ajax post with msg "+msg)
    
    superagent
      .post('http://localhost:9000/vote')
      .send(msg)
      .withCredentials()
      .end(function(res) {
        console.log(res)
      })

  }
  this.onReceive = function(event, cb) {
    this.conn.addEventListener(event, function(e) {
      var data = JSON.parse(e.data)
      cb(data)
    })
  }
  this.defaultHandler = function(m) {
    console.log("Receive with no event type", m)
  }
  this.conn.addEventListener('message', this.defaultHandler)
}

function WS() {
  var self = this
  this.conn = new WebSocket('ws://localhost:9000/stream');
  this.send = function(msg) {
    this.conn.send(JSON.stringify(msg))
  };
  this.cbs = {};
  this.onReceive = function(event, cb) {
    this.cbs[event] = cb
  }
  this.conn.onmessage = function(e) {
    var data = JSON.parse(e.data)
    var cb = self.cbs[data.event]
    if(cb) cb(data)
    else console.log("msg receive with no handler", e)
  }
}

var connection = new WS()
var Test = React.createClass({
  mixins: [titleMixin("noob")],
  componentWillMount: function() {
    var self = this
    connection.onReceive("counter", function(data) {
      console.log("data", data)
      console.log(data.counter)
      self.setState({counterz: data.counter})
    })
  },
  getInitialState: function() {
    return {
      counter: 0
    };
  },
  update: function() {
    connection.send({counter: "lol"})
    this.setState({counter: this.state.counter + 1})
  },
  render: function() {
    return (
      <div>
        <div>Hello WOWaa</div>
        <div onClick={this.update}>
          {this.state.counter}
        </div>
        <div>{this.state.counterz}</div>
        <input type="text"/>
        <Toto/>
      </div>
    );
  }
});

var Toto = React.createClass({
  getInitialState: function() {
    return {}
  },
  render: function() {
    return <div>Totot</div>
  }
})

React.renderComponent(
  <Test/>,
  document.getElementById('app')
);