import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import { ChatBot } from 'aws-amplify-react';
import { Interactions } from 'aws-amplify';
import { ChatFeed, Message } from 'react-chat-ui'
import Dropzone from 'react-dropzone'
import config from './aws-exports'
import FacebookLoginButton from './FacebookLoginButton';
import Img from 'react-image'
import keys from './aws-keys'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var aws = require('aws-sdk');


/* global gresp, uid, audio, audioResponse */


export default class RChatBot extends Component {
  state = {
    input: '',
    finalMessage: '',
    messages: [
      new Message({
        id: 1,
        message: "How can I help you today?",
      })
    ],
    id: '',
    name: '',
    picture: '',
  }

  componentDidUpdate() {
    var obj = this;
    if(this.state.id) {
      navigator.mediaDevices.getUserMedia({audio:true})
      .then(function onSuccess(stream) {

        var recorder = window.recorder = new MediaRecorder(stream);

        var data = [];
        recorder.ondataavailable = function(e) {
          data.push(e.data);
        };

        recorder.onerror = function(e) {
          throw e.error || new Error(e.name);       }

        recorder.onstart = function(e) {
          data = [];
        }

        recorder.onstop = function(e) {

          var blobData = new Blob(data, {type: 'audio/x-l16'});

          //audio.src = window.URL.createObjectURL(blobData);
          var reader = new FileReader();
          reader.onload = function() {
            var audioContext = new AudioContext();
            audioContext.decodeAudioData(reader.result, function(buffer) {

              reSample(buffer, 16000, function(newBuffer){

                var arrayBuffer = convertFloat32ToInt16(newBuffer.getChannelData(0));  
                sendToServer(arrayBuffer);
              });
            });
          };
          reader.readAsArrayBuffer(blobData);
        }

      })
      .catch(function onError(error) {
        console.log(error.message);
      });
      var startBtn = document.getElementsByClassName('record-it')[0];
      //var stopBtn = document.getElementById('stopBtn');

      startBtn.onclick = start;
      //stopBtn.onclick = stop;

      function start() {
        //this.setState({recording: true});
        setTimeout(function() {
          stop()  
        }, 3000)
        startBtn.style.color = "#f00";
        startBtn.disabled = true;
        window.recorder.start()
      }

      function stop(){
        startBtn.style.color = "#000"
        window.recorder.stop()
        startBtn.disabled = false;
      }

      function reSample(audioBuffer, targetSampleRate, onComplete) {
          var channel = audioBuffer.numberOfChannels;
          var samples = audioBuffer.length * targetSampleRate / audioBuffer.sampleRate;

          var offlineContext = new OfflineAudioContext(channel, samples, targetSampleRate);
          var bufferSource = offlineContext.createBufferSource();
          bufferSource.buffer = audioBuffer;

          bufferSource.connect(offlineContext.destination);
          bufferSource.start(0);

        offlineContext.startRendering().then(function(renderedBuffer){
                onComplete(renderedBuffer);
          })
      }

      function convertFloat32ToInt16(buffer) {
          var l = buffer.length;
          var buf = new Int16Array(l);
          while (l--) {
            buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
          }
          return buf.buffer;
        }

      var myCredentials = new aws.CognitoIdentityCredentials({IdentityPoolId:'us-west-2:ac0dfac4-c424-4d5a-8cd5-42e026d16310'}),
      myConfig = new aws.Config({
          credentials: myCredentials,
          "accessKeyId":keys.accessKeyId, 
          "secretAccessKey": keys.secretAccessKey,
          "region": keys.region,
      });


      function sendToServer(audioData){
        console.log('in sendToServer');
          var params = {
            botAlias: 'lol', /* required */
            botName: 'social', /* required */
            contentType: 'audio/x-l16; sample-rate=16000; channel-count=1', /* required */
            inputStream: audioData, /* required */
            userId: 'hello', /* required */
            accept: 'audio/mpeg',
            //sessionAttributes: '' /* This value will be JSON encoded on your behalf with JSON.stringify() */
          };
          console.log(keys);
          var lexruntime = new aws.LexRuntime(keys);
          lexruntime.postContent(params, function(err, data) {
            console.log('inpost');
            if (err) console.log('ERROR!', err, err.stack); // an error occurred
            else {
              console.log('in else');
              console.log(data);
              console.log(data.audioStream);
               var uInt8Array = new Uint8Array(data.audioStream);
               var arrayBuffer = uInt8Array.buffer;
               var blob = new Blob([arrayBuffer]);
               console.log(blob);
               var url = URL.createObjectURL(blob);
              // audioResponse.src = url;
              // audioResponse.play();

              const input = data["inputTranscript"]
              if (input === '') return
              const message = new Message({
                id: 0,
                message: input,
              })
              let messages = [...obj.state.messages, message]

              obj.setState({
                messages,
                input: ''
              })
              const responseMessage = new Message({
                id: 1,
                message: data["message"],
              })
              const resp_message = data["message"];
              messages  = [...obj.state.messages, responseMessage]
              obj.setState({ messages })

              if(resp_message!== '') {
                let n = resp_message.includes("feed");
                if(n) {
                  fetchhh(gresp);
                }
                let p = resp_message.includes("photo");
                if(p) {
                  fetchphotos();
                }
                let q = resp_message.includes("like");
                if(q) {
                  fetchlikes(gresp);
                }  
              }
            }
          });
      }
    }  
  }

  onChange(e) {
    const input = e.target.value
    this.setState({
      input
    })
  }
  handleComplete(err, confirmation) {
    if (err) {
      alert('Bot conversation failed')
      return;
    }
    alert('Success: ' + JSON.stringify(confirmation, null, 2));
    return 'Reservation booked. Thank you! What would you like to do next?';
  }
  _handleKeyPress = (e) => {
    const { input } = this.state
    if (e.key === 'Enter') {
      this.submitMessage()
    }
  }
  async submitMessage() {
    const { input } = this.state
    if (input === '') return
    const message = new Message({
      id: 0,
      message: input,
    })
    let messages = [...this.state.messages, message]

    this.setState({
      messages,
      input: ''
    })
    const response = await Interactions.send("social", input);
    const responseMessage = new Message({
      id: 1,
      message: response.message,
    })
    const resp_message = response.message;
    messages  = [...this.state.messages, responseMessage]
    this.setState({ messages })
    console.log(messages);
    if(resp_message!== '') {
      let n = resp_message.includes("feed");
      if(n) {
        fetchhh(gresp);
      }
      let p = resp_message.includes("photo");
      if(p) {
        fetchphotos();
      }
      let q = resp_message.includes("like");
      if(q) {
        fetchlikes(gresp);
      }  
    }
    if (response.dialogState === 'Fulfilled') {
      if (response.intentName === 'showme') {
        // const { slots: { FlowerType, PickupDate, PickupTime } } = response
        // const finalMessage = `Congratulations! Your trip to ${​FlowerType}  with a ${​PickupDate} rooom on for ${​PickupTime} days has been booked!!`
        // this.setState({ finalMessage })
      }
    }
  }

  updateUsername = (data) => {
    console.log(data);
    this.setState({id: data.id, name: data.name, picture: data.picture});
  }

  logout = () => {
    window.FB.logout(function(response) {
      // user is now logged out
      console.log('logged out')
    });
    this.setState({id: ''});
  }

  render() {
  const { id } = this.state;
  return (
      <div className="App chatbot">
        {!id ? (<div>
          <p className="w-text">Hey! Please log in to continue.</p>
          <FacebookLoginButton username={id} updateUsername={this.updateUsername} />
        </div>):(
        <div className="cont">
        <div style={styles.messagesContainer} className="lex">
          <img className="img-responsive" src={this.state.picture} /> 
          <p className="w-text">Welcome {this.state.name}! <button className="btn logout-btn" onClick={this.logout}>Logout</button></p>
          <h2>{this.state.finalMessage}</h2>
          <ChatFeed
            messages={this.state.messages}
            hasInputField={false}
            bubbleStyles={styles.bubbleStyles}
          />
          <input
            onKeyPress={this._handleKeyPress}
            onChange={this.onChange.bind(this)}
            style={styles.input}
            value={this.state.input}
            id="lex-input"
          />
          <button className="record-it">
            <FontAwesomeIcon icon="microphone" />
          </button>
        </div>
        <div id="record">
          
        </div>
        </div>)}
      </div>
    );
  }
}

function fetchhh(resp) {
    window.FB.api(
      "/me/feed",
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          //  var aws = require('aws-sdk');
          console.log('i am here before sqs');
          var sqs = new aws.SQS(keys);
          console.log('i am here in if');
          console.log(response);
          response['resp'] = resp;
          var params = {
            MessageBody: JSON.stringify(response),
            QueueUrl: "https://sqs.us-west-2.amazonaws.com/457946912569/fb_app",
            MessageAttributes: {
              someKey: { DataType: 'String', StringValue: "string"}
            }
          };
          sqs.sendMessage(params, function(err, data) {
            console.log('i hereheheheheheheh');
            if (err) console.log('error '+err.stack); //common.logError(err, err.stack); // an error occurred
            else    console.log(data); //common.log(data);           // successful response
          });

            //refresh(resp['authResponse']['userID'])
          fetchfromlambda();
          console.log(response);
        }
        else{

          console.log('i am here');
          console.log(response.error);
        }
      }
    )
  }

  function fetchfromlambda(){
    console.log("in fetchfromlambda");
    console.log(uid);
      // var temp = JSON.parse({"u_id" : uid});
    var lambd = new aws.Lambda({"accessKeyId":keys.accessKeyId, "secretAccessKey": keys.secretAccessKey,"region": keys.region, "apiVersion": '2015-03-31'});
    var params = {
      FunctionName: 'fetchfromdynamo',
      Payload: uid.toString()
    };
    lambd.invoke(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        console.log('youydfsadgffdgn');
        console.log(data);
        var a = JSON.stringify(data);
        console.log('this is a');
        console.log(a);
        console.log(JSON.parse(a));
        var b = JSON.parse(a);
        console.log('this is b');
        console.log(b['Payload']);
        var c = JSON.parse(b['Payload'])
        console.log(c['audio_link']);
        var text = c['text'];
        console.log(text);
        var sound      = document.createElement('audio');
        sound.id       = 'audio-player';
        sound.controls = 'controls';
        sound.src      = c['audio_link'];
        sound.type     = 'audio/mpeg';
        var myNode = document.getElementById("record");
        while (myNode.firstChild) {
          myNode.removeChild(myNode.firstChild);
        }
        myNode.appendChild(sound);
        try {
          sound.play();
        }
        catch(err) {
          console.log(err);
        }
      }
    });
  }

  function fetchphotos() {  
    console.log("in fetchphotos");
    window.FB.api(
      "/me/photos?fields=images",
      function (response) {
        if (response && !response.error) {
          console.log("fetchphotos in function resp");
          /* handle the result */
          //  var aws = require('aws-sdk');
          var temp = response.data;
          var i=0;
          var temp1 = [];
          console.log(temp);
          for (i=0;i<temp.length;i++){

            temp1[i]=temp[i].images[0].source;
          }
          let mainElement = document.getElementById("record");
          // document.getElementsByClassName("record-it")[0].classList.add("new-style-btn");


          while (mainElement.firstChild) {
            mainElement.removeChild(mainElement.firstChild);
          }

          let images = document.createElement('div');
          images.classList.add("fb-images");

          for(i=0; i<temp1.length; i++) {
            let image = document.createElement('img');
            image.classList.add("img-responsive");
            image.classList.add("timeline");
            image.src = temp1[i];
            image.height = 100;
            image.width = 100;
            images.appendChild(image);
          }
          mainElement.appendChild(images);
        }
        else{
          console.log(response.error);
        }
      }
    );
  }

  function fetchfromlambda_likes() {
    var lambd = new aws.Lambda({"accessKeyId":keys.accessKeyId, "secretAccessKey": keys.secretAccessKey,"region": keys.region, "apiVersion": '2015-03-31'});
    var params = {
      FunctionName: 'fetchlikesfromdynamo',
      Payload: uid.toString()
    };
    lambd.invoke(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        var a = JSON.stringify(data);
        var b = JSON.parse(a);
        var c = JSON.parse(b['Payload'])
        var text = c['text'];
        var sound      = document.createElement('audio');
        sound.id       = 'audio-player';
        sound.controls = 'controls';
        sound.src      = c['audio_link'];
        sound.type     = 'audio/mpeg';
        var myNode = document.getElementById("record");
        while (myNode.firstChild) {
          myNode.removeChild(myNode.firstChild);
        }
        myNode.appendChild(sound);
        try {
          sound.play();
        }
        catch(err) {
          console.log(err);
        }
      }
    });
  }

  function fetchlikes(resp){
      window.FB.api(
      "/me/likes",
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          //  var aws = require('aws-sdk');
          var sqs = new aws.SQS(keys);

          response['resp'] = resp;
          var params = {
            MessageBody: JSON.stringify(response),
            QueueUrl: "https://sqs.us-west-2.amazonaws.com/457946912569/social_likes",
            MessageAttributes: {
              someKey: { DataType: 'String', StringValue: "string"}
            }
          };
          sqs.sendMessage(params, function(err, data) {
            if (err) console.log('error '+err.stack); //common.logError(err, err.stack); // an error occurred
            else    console.log(data); //common.log(data);           // successful response
          });

          fetchfromlambda_likes();
        }
        else{
          console.log(response.error);
        }
      }
    );
  }

const styles = {
  bubbleStyles: {
    text: {
      fontSize: 16,
    },
    chatbubble: {
      borderRadius: 30,
      padding: 10
    }
  },
  headerTitle: {
    color: 'white',
    fontSize: 22
  },
  header: {
    backgroundColor: 'rgb(0, 132, 255)',
    padding: 20,
    borderTop: '12px solid rgb(204, 204, 204)'
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    alignItems: 'center'
  },
  input: {
    fontSize: 16,
    padding: 10,
    outline: 'none',
    width: 350,
    border: 'none',
    borderBottom: '2px solid rgb(0, 132, 255)'
  }
}