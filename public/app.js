const socket = io();

let localStream;
let peer;
let myId;
let targetUser;

socket.on("your-id", (id) => {
  myId = id;
  document.getElementById("myId").innerText = id;
});

document.getElementById("startVideo").onclick = async () => {
  document.getElementById("videoSection").style.display = "block";

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  document.getElementById("localVideo").srcObject = localStream;

  peer = new RTCPeerConnection();

  localStream.getTracks().forEach(track => {
    peer.addTrack(track, localStream);
  });

  peer.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };

  peer.onicecandidate = (event) => {
    if (event.candidate && targetUser) {
      socket.emit("signal", {
        to: targetUser,
        signal: event.candidate
      });
    }
  };
};

document.getElementById("requestUser").onclick = async () => {
  targetUser = prompt("Enter user ID:");
  if (!targetUser) return;

  socket.emit("request-call", targetUser);

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("signal", {
    to: targetUser,
    signal: offer
  });
};

socket.on("incoming-call", (callerId) => {
  targetUser = callerId;
  alert("Incoming call from " + callerId);
});

document.getElementById("acceptCall").onclick = async () => {
  if (!peer) return;

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("signal", {
    to: targetUser,
    signal: answer
  });
};

socket.on("signal", async (data) => {
  if (!peer) return;

  if (data.signal.type === "offer") {
    await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
  } else if (data.signal.type === "answer") {
    await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
  } else {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(data.signal));
    } catch (e) {}
  }
});