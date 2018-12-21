// import React, { Component } from "react";
// import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
// import "./Login.css";
// import { Auth } from "aws-amplify";


// export default class Login extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       val: "",
//       password: ""
//     };
//   }

//   validateForm() {
//     return this.state.val.length > 0 && this.state.password.length > 0;
//   }

//   handleChangeText = event => {
//     this.setState({
//       val: event.target.value
//     });
//   }

//   handleChangePassword = event => {
//     this.setState({
//       password: event.target.value
//     });
//   }

//   handleSubmit = async event => {
// 	  event.preventDefault();

// 	  try {
// 	    await Auth.signIn(this.state.val, this.state.password);
// 	    {this.props.userAuth()}
// 	  } catch (e) {
// 	    alert(e.message);
// 	  }
//   }

//   render() {
//     return (
//       <div className="Login">
//         <form onSubmit={this.handleSubmit}>
//           <FormGroup controlId="formBasicText">	
//           <ControlLabel>Username</ControlLabel>
//           <FormControl
//             type="text"
//             value={this.state.val}
//             placeholder="Enter text"
//             onChange={this.handleChangeText}
//           />
//           </FormGroup>
//           <FormGroup controlId="password" bsSize="large">
//             <ControlLabel>Password</ControlLabel>
//             <FormControl
//               value={this.state.password}
//               onChange={this.handleChangePassword}
//               type="password"
//             />
//           </FormGroup>
//           <Button
//             block
//             bsSize="large"
//             disabled={!this.validateForm()}
//             type="submit"
//           >
//             Login
//           </Button>
//         </form>
//       </div>
//     );
//   }
// }

import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Login.css";
import { Auth } from "aws-amplify";


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.signIn(this.state.email, this.state.password);
      this.props.userHasAuthenticated(true);
      this.props.history.push("/");
    } catch (e) {
      // alert(e.message);
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Login"
            loadingText="Logging in…"
          />
        </form>
      </div>
    );
  }
}