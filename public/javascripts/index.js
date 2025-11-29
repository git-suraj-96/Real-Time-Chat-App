const socket = io();

const sendBtn = document.querySelector(".send-btn");
const messageBox = document.querySelector(".message-box");

// Chat panel elements
const chatBox = document.querySelector(".chat");
const chatBoxUserName = document.querySelector(".suraj");
const chatBoxUserStatus = document.querySelector(".chat-status");

// Online users container
const chatsBox = document.querySelector(".chats-box");

// user chat box jahan chat detail dikhega
const userChatBox = document.querySelector(".user-chat-box");

// flash message
const flashMessage = document.querySelector(".flash-message");

const arrowBackBtn = document.querySelector(".arrow-back");
const hello = document.querySelector(".hello");

let receiverSocketId = null;

function getTime() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  // Make them 2-digit
  hours = String(hours).padStart(2, "0");
  minutes = String(minutes).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function createLeftSide(message) {
  const child = document.createElement("div");
  child.className = "flex max-w-lg justify-start";

  child.innerHTML = `<div
                      class="rounded-r rounded-b bg-received-bubble-light p-2 shadow-sm dark:bg-received-bubble-dark"
                    >
                      <p
                        class="text-sm text-text-primary-light dark:text-text-primary-dark"
                      >
                        ${message}
                      </p>
                      <p
                        class="text-right text-[11px] text-text-secondary-light dark:text-text-secondary-dark"
                      >
                        ${getTime()}
                      </p>
                    </div>`;
  userChatBox.appendChild(child);
}

function creatRightSide(message) {
  const child = document.createElement("div");
  child.className = "flex max-w-lg justify-end self-end";
  child.innerHTML = `<div
                      class="rounded-l rounded-b bg-sent-bubble-light p-2 shadow-sm dark:bg-sent-bubble-dark"
                    >
                      <p
                        class="text-sm text-text-primary-light dark:text-text-primary-dark"
                      >
                        ${message}
                      </p>
                      <p
                        class="flex items-center justify-end gap-1 text-right text-[11px] text-text-secondary-light dark:text-text-secondary-dark"
                      >
                        ${getTime()}
                        <span
                          class="material-symbols-outlined !text-[14px] !font-bold text-blue-500"
                          >done_all</span
                        >
                      </p>
                    </div>`;
  userChatBox.appendChild(child);
}

/* ------------------------------------------
   CLICK EVENT USING EVENT DELEGATION
------------------------------------------- */
chatsBox.addEventListener("click", (e) => {
  const chat = e.target.closest(".single-chat");
  if (!chat) return;

  receiverSocketId = chat.dataset.socket;

  const username = chat.querySelector(".username").innerText;
  const status = chat.querySelector(".status").innerText;

  chatBoxUserName.innerHTML = username;
  chatBoxUserStatus.innerHTML = status;
  chatBox.style.display = "block";

  // console.log("Receiver:", receiverSocketId);
});

/* ------------------------------------------
   SEND MESSAGE
------------------------------------------- */
sendBtn.addEventListener("click", () => {
  if (messageBox.value && receiverSocketId) {
    creatRightSide(messageBox.value);
    socket.emit("message", {
      msg: messageBox.value,
      id: receiverSocketId,
    });

    messageBox.value = "";
  }
});

/* ------------------------------------------
   RECEIVE MESSAGE
------------------------------------------- */
socket.on("msg", (data) => {
  // console.log("MESSAGE RECEIVED:", data);
  // console.log("SenderId: ", data.from);
  // console.log("Message: ", data.msg);
  flashMessage.innerHTML = `You have received message from ${data.fullname}`;
  flashMessage.style.display = "block";
  createLeftSide(data.msg);
  navigator.vibrate([200, 100, 200]);
  hello.scroll(0, hello.scrollHeight + 1000);
  setTimeout(() => {
    flashMessage.style.display = "none";
  }, 3000);
});

/* ------------------------------------------
   ONLINE USERS UPDATE
------------------------------------------- */
socket.on("onlineusers", (users) => {
  chatsBox.innerHTML = "";

  users.forEach((user) => {
    let child = document.createElement("div");
    child.className =
      "flex cursor-pointer justify-between gap-4 bg-primary/20 px-4 py-3 dark:bg-input-bg-dark single-chat margin-top";

    child.setAttribute("data-socket", user.socketId);

    child.innerHTML = `
      <div class="flex items-start gap-3">
        <div
          class="h-12 w-12 flex-shrink-0 rounded-full bg-cover bg-center"
          style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZUz08FeN3AzoXtTeXyypfhU_4qZAKpILcuum89SeQTed_ukaxqSkYyaZnom9En-mGH765tbaP8nu2Ykn-KwGV837FBum71PPQiSDjkPtnMYzkuR9w-XiuYWjlXRpufymK0ICbdf8FH42Uvk2-mDDPPcnUu-Ez4b5i03yETt3-AJ2mU2MlSBnVmqXGNeWRzsUhZmkeMlc5TElOBRtwzNtempAFiIy8qgmkJQCDxNhbMeuFCB4syionFnN6CtOHj9P7KHmFWojWhjg');">
        </div>

        <div class="flex flex-1 flex-col justify-center">
          <p class="font-medium text-text-primary-light dark:text-text-primary-dark username">
            ${user.fullname}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end">
        <p class="text-xs font-medium text-primary status">online</p>
      </div>
    `;

    chatsBox.appendChild(child);
  });
});

arrowBackBtn.addEventListener("click", () => {
  chatBox.style.display = "none";
});


//  ---------------DATE 29-11-2025------------------------
// ----------------------From here starting video call chat system-------------------------
const videoContainer = document.querySelector(".video-container");
const videoCallBtn = document.querySelector(".video-call-btn");
const localVideo = document.getElementById('user-1');
const remoteVideo = document.getElementById('user-2');
const endCallBtn = document.querySelector(".call-end");


let localStream;
let caller = [];


// Single Methodd for Peer connection
const PeerConnection = (function(){
  let peerConnection;
  const createPeerConnection = () => {
    const config = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    };
    peerConnection = new RTCPeerConnection(config);

    // add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    })
    // listen to remote stream and add to peer conenction
    peerConnection.ontrack = function(event) {
      remoteVideo.srcObject = event.streams[0];
    }
    // listen for ice candidate
    peerConnection.onicecandidate = function(event){
      if(event.candidate){
        socket.emit('icecandidate', event.candidate);
      }
    }

    return peerConnection;

  }
  return {
    getInstace: () => {
      if(!peerConnection){
        peerConnection = createPeerConnection();
      }
      return peerConnection;
    }
  }
})();

videoCallBtn.addEventListener('click', async (e)=>{
    videoContainer.style.display = 'block';
    startCall(receiverSocketId);
})

endCallBtn.addEventListener('click', (e)=>{
  socket.emit('call-ended', caller)
})

// start call method
const startCall = async (user) => {
  console.log(user);
  const pc = PeerConnection.getInstace();
  const offer = await pc.createOffer();
  console.log(offer);
  await pc.setLocalDescription(offer);
  socket.emit('offer', {from : socket.id, to: user, offer: pc.localDescription});
}

// end call
const endCall = () =>{
  const pc = PeerConnection.getInstace();
  if(pc) {
    pc.close();
  }
}


// initialize app
const startMyVideo = async () => {
  try{
    const stream = await navigator.mediaDevices.getUserMedia({video : true, audio : true});
    localStream = stream;
    localVideo.srcObject = stream;
  }catch(err){
    console.log(err);
  }
}

startMyVideo();

// handle socket events
socket.on('offer', async ({from, to, offer})=>{

  videoContainer.style.display = 'block';
  const pc = PeerConnection.getInstace();
  
  // set local description
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', {from, to, answer: pc.localDescription});
  caller = [from, to];
});

socket.on('answer', async ({from, to, answer})=>{
  const pc = PeerConnection.getInstace();
  await pc.setRemoteDescription(answer);
  socket.emit('end-call', {from, to});
  caller = [from, to];
});

socket.on('icecandidate', async candidate => {
  const pc = PeerConnection.getInstace();
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
})


socket.on('call-ended', (caller) =>{
  endCall();
  flashMessage.style.display = "block";
  flashMessage.innerHTML = "Call Ended";
  setTimeout(() => {
    flashMessage.style.display = "none";
    flashMessage.innerHTML = "";
    videoContainer.style.display = "none";
  }, 3000);
})