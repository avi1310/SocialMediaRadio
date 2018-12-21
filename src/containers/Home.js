import React, { Component } from "react";
import "./Home.css";
import RChatBot from "./../ChatBot";
import Login from "./Login" 

export default class Home extends Component {
  render() {
    return (
      this.props.isAuthenticated
                ? <RChatBot />
                : <Login props={this.props}/>
    );
  }
}