var mapPeer = {};
var username_input = document.querySelector('#username-input');
var btn_join = document.querySelector('#login');
var audio_btn = document.querySelector('#audio');
var userName;
var webSocket;
var offer

function webSocketOnMessage(event) {
    console.log(userName);
    var parsedData = JSON.parse(event.data);
    console.log('log1: ', parsedData);
    var peerUserName = parsedData['peer'];
    console.log('log2: ', peerUserName);
    var action = parsedData['action'];
    if (userName == peerUserName) {
        return;
    }

    var receiver_channel_name = parsedData['message']['reciever_channel_name'];

    if (action == 'new-peer') {
        createOffered(peerUserName, receiver_channel_name);
    }
    if (action == 'new-offer') {
        offer = parsedData['message']['sdp'];
        createAnswer(offer, peerUserName, receiver_channel_name);
        return;
    }

    if (action == 'new-answer') {
        var answer = parsedData['message']['sdp'];
        var peer = mapPeer[peerUserName][0];
        peer.setRemoteDescription(answer);
        return;
    }
}

btn_join.addEventListener('click', () => {

    userName = username_input.value;
    console.log('Username: ', userName);
    if (userName == '') {
        return;
    }

    username_input.value = '';
    username_input.disabled = true;
    username_input.style.visibility = 'hidden';

    btn_join.disabled = true;
    username_input.style.visibility = 'hidden';
    var labelUsername = document.querySelector('#lable-username');
    labelUsername.innerHTML = userName;

    var loc = window.location;
    var wsStart = 'ws://';

    if (loc.protocol == 'https:') {
        wsStart = 'wss://';
    }

    var endPoint = wsStart + loc.host + loc.pathname;

    console.log('Endpoint: ', endPoint);

    webSocket = new WebSocket(endPoint);


    webSocket.onopen = function(e) {
        console.log("Connection Open ", e);
        sendSignal('new-peer', {});

    }
    webSocket.onmessage = webSocketOnMessage;

    webSocket.onclose = function(e) {
        console.log('Connection closed! ', e);
    }

    webSocket.onerror = function(e) {
        console.log('Error occured! ', e);
    }

});

var localStream = new MediaStream();

var localAudio = document.querySelector("#local-audio");
const constraints = {
    'audio': true,

}
var userMedia = navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    localStream = stream;
    localAudio.srcObject = localStream;
    var audioTracks = stream.getAudioTracks();
    audioTracks[0].enabled = false;
    audio_btn.addEventListener('click', function(event) {


        if (event.target.value == 'off') {
            audioTracks[0].enabled = true;
            document.getElementById('audio').style.backgroundColor = '#F9A826';
            document.getElementById('audio').style.color = 'white';
            audio_btn.innerHTML = "Audio On";
            audio_btn.value = 'on';
            return;
        }
        audioTracks[0].enabled = false;
        document.getElementById('audio').style.backgroundColor = 'white';
        document.getElementById('audio').style.color = 'black';
        audio_btn.innerHTML = "Audio Off";
        audio_btn.value = 'off';




    });


}).catch(error => {
    console.log('Error Acessing media ', error);
});



function sendSignal(action, message) {

    var jsonstr = JSON.stringify({
        'peer': userName,
        'action': action,
        'message': message
    });

    webSocket.send(jsonstr);
}

function createOffered(username, channelName) {
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);
    var dataChannel = peer.createDataChannel('channel');
    dataChannel.onmessage = dataOnMessage;
    dataChannel.onopen = () => {
        console.log("Connection Opend");
    }

    var remoteAudio = createVideo(username);
    setOnTrack(peer, remoteAudio);

    mapPeer[username] = [peer, dataChannel];

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;
        if (iceConnectionState === "failed" || iceConnectionState === "disconnected" || iceConnectionState === "closed") {
            delete mapPeer[username];

            if (iceConnectionState != 'closed') {
                peer.close();
            }
            removeAudio(remoteAudio);
        }
    });
    peer.addEventListener('icecandidate', (event) => {

            if (event.candidate) {
                console.log("New-ice Candidate: ", JSON.stringify(peer.localDescription));
                return;
            }
            sendSignal('new-offer', {
                'sdp': peer.localDescription,
                'reciever_channel_name': channelName
            });
        }

    );
    peer.createOffer().then(o => peer.setLocalDescription(o)).then(() => {
        console.log('Local description set successfully');
    });
}

function addLocalTracks(peer) {
    localStream.getTracks().forEach(track => {
        console.log("Adding localStream tracks");
        peer.addTrack(track, localStream);
    });
}


function dataOnMessage(event) {
    var message = event.data;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

function createVideo(peerUsername) {
    var audioContainer = document.querySelector('#audio-container');
    var remoteAudio = document.createElement('audio');
    remoteAudio.id = peerUsername + '-audio';
    return remoteAudio;
}

function setOnTrack(peer, remoteAudio) {
    var remoteStream = new MediaStream();
    remoteAudio.scrObject = remoteStream;
    peer.addEventListener('track', async(event) => {
        remoteStream.addTrack(event.track, remoteStream);
    });
}

function removeAudio(remoteAudio) {
    var audioWrapper = remoteAudio.parentNode;
    audioWrapper.parentNode.removeChild(audioWrapper);
}

function createAnswer(peer, peerUsername, channel_name) {
    var peer = new RTCPeerConnection(null);
    addLocalTracks(peer);

    var remoteAudio = createVideo(peerUsername);
    setOnTrack(peer, remoteAudio);

    peer.addEventListener('datachannel', e => {
        peer.dataChannel = e.channel;
        peer.dataChannel.addEventListener('open', () => {
            console.log('Connection Opened !');
        });
        peer.dataChannel.addEventListener('message', dataOnMessage);

        mapPeer[peerUsername] = [peer, peer.dataChannel];


    });


    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;
        if (iceConnectionState === "failed" || iceConnectionState === "disconnected" || iceConnectionState === "closed") {
            delete mapPeer[peerUsername];

            if (iceConnectionState != 'closed') {
                peer.close();
            }
            removeAudio(remoteAudio);
        }
    });
    peer.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                console.log("New-ice Candidate: ", JSON.stringify(peer.localDescription));
                return;
            }
            sendSignal('new-answer', {
                'sdp': peer.localDescription,
                'reciever_channel_name': channel_name
            });
        }

    );
    peer.setRemoteDescription(offer).then(() => {
        console.log("remote Description set successfully %s: ", peerUsername);
        return peer.createAnswer();
    }).then(a => {
        console.log('Answer Created !');
        peer.setLocalDescription(a);
    })
}

var btnmessageSend = document.querySelector('#send-message');
btnmessageSend.addEventListener('click', sendMessage);
var messageInput = document.querySelector('#message-input');
var messageList = document.querySelector('#message-list');

function sendMessage() {
    var message = messageInput.value;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode('Me: ' + message));
    messageList.appendChild(li);

    var dataChannels = getDataChannel();
    message = userName + ': ' + message;
    console.log(message);
    for (index in dataChannels) {
        dataChannels[index].send(message);
    }

    messageInput.value = '';
}

function getDataChannel() {
    var dataChannels = [];
    for (peerusername in mapPeer) {
        var dataChannel = mapPeer[peerusername][1];
        dataChannels.push(dataChannel);
    }
    return dataChannels;
}