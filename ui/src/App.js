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

  render() {
    const events = this.state.events;

    return (
      <Dashboard items={events} />
    );
  }
}

export default App;
