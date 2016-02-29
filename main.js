/* Globals */
var inputAddress;
var inputPassword;
var inputAddress;

var buttonInvite;
var buttonAccept;
var buttonTerminate;
var buttonReject; //TODO

var formID;
var user_Agent;
var localVideo; //TODO
var remoteVideo;
//todo gör en initbuttons function som mappar allt till document.getEl...
function SIP_Communicator() {
  /*   set global variables */
  this.inputAddress = document.getElementById('inputAddress');
  this.inputPassword = document.getElementById('inputPassword');
  this.formID = document.getElementById('formID');
  this.formID.addEventListener('submit', function(event){
    event.preventDefault();
    this.requestCredentials();
  }.bind(this), false);  //testa att köra requestCredentials i onClick och rensa här

  this.user_Agent = document.getElementById('user_Agent');
  this.remoteVideo = document.getElementById('remoteVideo');
  this.localVideo = document.getElementById('localVideo');
  this.inputAddress = document.getElementById('inputAddress');
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
    httpRequest.onload = this.setCredentials.bind(true);
    xhr.open('get', 'https://api.onsip.com/api/?Action=UserRead&Output=json');

    var userPW = this.inputAddress.value + ':' + this.inputPassword.value;
    httpRequest.setRequestHeader('Authorization', 'Basic' + btoa(userPW));
    httpRequest.send();
  },

  setCredentials: function(e) {
    var httpRequest = e.target;
    var user;
    var credentials;

    if(httpRequest.status === 200) {
      user = JSON.parse(httpRequest.responseText).Response.Result.UserRead.User;
      credentials = {
        uri: this.addressInput.value,
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
    this.identityForm.style.display = 'none';
  }

}
