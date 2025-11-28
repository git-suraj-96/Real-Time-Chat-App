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

function creatRightSide(message){
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
  setTimeout(()=>{
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

arrowBackBtn.addEventListener("click", ()=>{
    chatBox.style.display = "none";
})









// Video-call handle code yahan hai
const muteBtn = document.querySelector(".mute");
const speakerBtn = document.querySelector(".speaker");
const endCallBtn = document.querySelector('.call-end');
let muteGray = true;
let speakerGray = true;
const videoContainer = document.querySelector(".video-container");
const pickupCallBox = document.querySelector(".pickup-call-box");
const pickupCallBoxPickup = document.querySelector(".pickup-call");
const pickupCallBoxEnd = document.querySelector(".cut-call");
const videoCallBtn = document.querySelector('.video-call-btn');


// it will create gray color of mute btn while user click on that
muteBtn.addEventListener('click', ()=>{
  if(muteGray){
    muteBtn.style.backgroundColor = "gray";
    muteGray = false
  }else{
    muteBtn.style.backgroundColor = "white";
    muteGray = true;
  }
})

// when user click on the speaker btn then it will do gray colo
speakerBtn.addEventListener('click', ()=>{
  if(speakerGray){
    speakerBtn.style.backgroundColor = "gray";
    speakerGray = false
  }else{
    speakerBtn.style.backgroundColor = "white";
    speakerGray = true;
  }
})

// main function that handle video calling
let peerConnection = new RTCPeerConnection()
let localStream;
let remoteStream;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
        });
    };
}

let createOffer = async () => {


    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if(event.candidate){
            let offerPath = JSON.stringify(peerConnection.localDescription);
            socket.emit('offer-sdp', {offerpath : offerPath, receiverId : receiverSocketId, senderId : socket.id});
            
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}

let createAnswer = async (sdpOffer, senderid) => {

    let offer = JSON.parse(sdpOffer)

    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if(event.candidate){
            console.log('Adding answer candidate...:', event.candidate)
            let sdpAnswer = JSON.stringify(peerConnection.localDescription)
            socket.emit('sdp-answer', {answer : sdpAnswer, receiver :  senderid});
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer); 
}

let addAnswer = async (path) => {
    console.log('Add answer triggerd')
    let answer = JSON.parse(path)
    console.log('answer:', answer)
    if (!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer);
    }
}




videoCallBtn.addEventListener('click', async ()=>{
  videoContainer.style.display = 'block';
  await init();
  createOffer();
})


socket.on('sdp-offer', async (data)=>{
  // console.log(data.data.offerpath);
  videoContainer.style.display = "block";
  await init();
  createAnswer(data.data.offerpath, data.data.senderId);
})

socket.on('answer', (data) => {
  addAnswer(data.answer);
})