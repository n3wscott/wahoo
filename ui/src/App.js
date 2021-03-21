import React, {Component} from "react";
import Dashboard from './Dashboard';
import "./App.css"
import ReconnectingWebSocket from 'reconnecting-websocket';


export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
    }
  }

  componentDidMount() {
    console.log("Protocol: " + window.location.protocol);
    let wsURL = "ws://" + document.location.host + "/ws";
    if (window.location.protocol === 'https:') {
      wsURL = "wss://" + document.location.host + "/ws";
    }

    wsURL = "ws://wahoo.default.d2k.n3wscott.com/ws"
    console.log("WS URL: " + wsURL);
 
    let that = this;

    let sock = new ReconnectingWebSocket(wsURL);
    sock.onopen = function () {
      console.log("connected to " + wsURL);
      //let fab = document.getElementById("fab");
      //fab.setAttribute("wahoo-connected", "true");
    };
    sock.onclose = function (e) {
      console.log("connection closed (" + e.code + ")");
      //fab.setAttribute("wahoo-connected", "false");
    };
    sock.onmessage = function (e) {
      window.dispatchEvent(new Event('cloudevent'));
      let t = JSON.parse(JSON.parse(e.data)); // at the moment the ws sends down a double encoded thing.

      console.log(t)
      that.onCloudEvent(t)
    };
  }

  onCloudEvent(event) {
    let data = {id: event.id};

    Object.keys(event).forEach(key => {
      if (key === "data") {
        data[key] = JSON.stringify(event[key]);
        return;
      }
      data[key] = event[key];
    });

    let al = [...this.state.events];
    al.push(data)

    this.setState( {
        events: al
    });
  }


  render() {
    const events = this.state.events;

    return (
      <Dashboard items={events} />
    );
  }
}

export default App;
