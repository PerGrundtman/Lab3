/* Globals */
var inputAddress;
var inputPassword;
var inputDestination;

var buttonInvite;
var buttonAccept;
var buttonTerminate;
var buttonReject; //TODO

var formID;
var ua;
var user_Agent;
var localVideo; //TODO
var remoteVideo;
//todo gör en initbuttons function som mappar allt till document.getEl...
function SIP_Communicator() {
  /*   set global variables */
  this.inputAddress = document.getElementById('inputAddress');
  this.inputPassword = document.getElementById('inputPassword');
  this.formID = document.getElementById('formID');
  this.formID.addEventListener('submit', function(e){
    e.preventDefault();
    this.requestCredentials();
  }.bind(this), false);  //testa att köra requestCredentials i onClick och rensa här

  this.user_Agent = document.getElementById('user_Agent');
  this.remoteVideo = document.getElementById('remoteVideo');
  this.localVideo = document.getElementById('localVideo');
  this.inputDestination = document.getElementById('inputDestination');
  this.buttonInvite = document.getElementById('buttonInvite');
  this.buttonInvite.addEventListener('click', this.sendInvite.bind(this), false);

  this.buttonAccept = document.getElementById('buttonAccept');
  this.buttonAccept.addEventListener('click', this.acceptSession.bind(this), false);

  this.buttonReject = document.getElementById('buttonReject');
  this.buttonTerminate = document.getElementById('buttonTerminate');
  this.buttonTerminate.addEventListener('click', this.terminateSession.bind(this), false);
}

SIP_Communicator.prototype = {
  /* 
  code to allow for authentication, using the onsip API.
  documentation from: http://developer.onsip.com/guides/user-agent-authentication/ 
  */
  requestCredentials: function() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onload = this.setCredentials.bind(this);
    httpRequest.open('get', 'https://api.onsip.com/api/?Action=UserRead&Output=json');


    var userPW = this.inputAddress.value + ':' + this.inputPassword.value;
   
    httpRequest.setRequestHeader('Authorization',
                         'Basic ' + btoa(userPW));
    httpRequest.send();
  },

  setCredentials: function(e) {
    var httpRequest = e.target;
    var user;
    var credentials;

    if(httpRequest.status === 200) {
      user = JSON.parse(httpRequest.responseText).Response.Result.UserRead.User;
      credentials = {
        uri: this.inputAddress.value,
        authorizationUser: user.AuthUsername,
        password: user.Password,
        displayName: user.Contact.Name
      };
    } else{
      alert('Auth failed! Logging in as anonymous user.');
      credentials = {}; //can't make calls but can receive as anonymous
    }
    /* if the user is not registered */
    this.createUA(credentials);
  },

  createUA: function (credentials) {
    this.formID.style.display = 'none';
    this.user_Agent.style.display = 'block';
    this.ua = new SIP.UA(credentials);
    this.ua.on('invite', this.handleInvite.bind(this));

  },
  handleInvite: function (session) {

    if(this.session){
      session.reject();
      alert('FUCK');
      return;  //TODO
    }
    this.setSession(session); 
    this.setStatus('Ring Ring! ' + session.remoteIdentity.uri.toString() + ' is calling!', true);
    this.buttonAccept.disabled = false;
  },

  acceptSession: function() {
    if(!this.session) { 
      return; 
    }
    this.buttonAccept.disabled=true;//TODO downlight button
    
    this.session.accept(this.remoteVideo);
  },

  sendInvite: function(){
    var dest = this.inputDestination.value;
    if(!dest) { 
      return;
       }

       var session = this.ua.invite(dest, this.remoteVideo);

       this.setSession(session);
       this.buttonInvite.disabled = true;//TODO downlight button
  },
  /*
    handling of all status cases
  */
  setSession: function(session){
    session.on('progress', function(){
      this.setStatus('progress', true);
    }.bind(this));

    session.on('accepted', function() {
      this.setStatus('accepted', true);
    }.bind(this));

    session.on('failed', function () {
      this.setStatus('failed', false);
      if (session === this.session) {
        delete this.session;
      }
    }.bind(this));

      session.on('bye', function () {
      this.setStatus('bye', false);
    
      if (session === this.session) {
        delete this.session;
      }
    }.bind(this));

      session.on('refer', session.followRefer(function (req, newSession) {
      this.setStatus('refer', true);
      this.setSession(newSession);
    }.bind(this)));

    this.session = session;
  },

  setStatus: function (status, disable) {
    this.user_Agent.className = status;
    this.buttonInvite.disabled = disable;
    this.buttonTerminate.disabled = !disable;
  },

  terminateSession: function() {
    if(!this.session) {
      return;
    }
    this.session.terminate();
  },


};
var SIP_Communicator = new SIP_Communicator();
