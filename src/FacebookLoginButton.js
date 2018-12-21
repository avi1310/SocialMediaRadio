import React from 'react';
import FacebookLogin from 'react-facebook-login';
import keys from './aws-keys'
var aws = require('aws-sdk');

/* global gresp, uid */

  class FacebookLoginButton extends React.Component {
    
    responseFacebook = (response) => {
      console.log(response);
      uid = response['id'];
      const name = response['name'];
      const picture = response['picture']['data']['url'];
      console.log(picture);
      const data = {
        id: uid,
        name: name,
        picture: picture
      }
      this.props.updateUsername(data);
      gresp = response;
      //fetchhh(response);
    }

 
    render() {
      return (
        <FacebookLogin
          appId="121430428773899"
          autoLoad={true}
          fields="name,email,picture"
          scope="public_profile,email, user_likes, user_photos, user_posts"
          callback={this.responseFacebook}
        />
      )
    }
  }

  function fetchhh(resp) {
    window.FB.api(
      "/me/feed",
      function (response) {
        console.log('i am here');
        if (response && !response.error) {
          /* handle the result */
          //  var aws = require('aws-sdk');
          var sqs = new aws.SQS(keys);
          console.log('i am here in if');
          response['resp'] = resp;
          console.log(response);
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
          console.log(response.err);
        }
      }
    )
  }

  function logout() {
    window.FB.logout(function(response) {
      // user is now logged out
      console.log('yo boy')
    });
  }
 


  function fetchfromlambda(){
    console.log("in fetchfromlambda");
    console.log(uid);
      // var temp = JSON.parse({"u_id" : uid});
    var lambd = new aws.Lambda({"accessKeyId":keys.accessKeyId, "secretAccessKey": keys.secretAccessKey, "region": keys.region, "apiVersion": '2015-03-31'});
    var params = {
      FunctionName: 'fetchfromdynamo',
      Payload: uid.toString()
    };
    console.log(params);
    lambd.invoke(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        console.log('youydfsadgffdgn');
        console.log(gresp);
        console.log(uid.toString());
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

  export default FacebookLoginButton;