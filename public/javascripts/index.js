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
const localVideo = document.getElementById("user-1");
const remoteVideo = document.getElementById("user-2");
const endCallBtn = document.querySelector(".call-end");

// --- ensure these exist earlier in file ---
let localStream;
let caller = [];

// ------- PeerConnection singleton with reset support -------
const PeerConnection = (function () {
  let peerConnection;
  const createPeerConnection = () => {
    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // add TURN servers here for deploy (see notes below)
      ],
    };
    const pc = new RTCPeerConnection(config);

    // add local stream tracks
    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));
    } else {
      console.warn("localStream not available when creating PeerConnection");
    }

    pc.ontrack = function (event) {
      remoteVideo.srcObject = event.streams[0];
      // try autoplay
      remoteVideo.autoplay = true;
      remoteVideo.playsInline = true;
    };

    pc.onicecandidate = function (event) {
      if (event.candidate) {
        // include the recipient socket id explicitly
        if (!caller || caller.length === 0) {
          console.warn("No caller info when sending icecandidate");
        }
        const to = caller[0] === socket.id ? caller[1] : caller[0]; // best-effort
        if (to) {
          socket.emit("icecandidate", { candidate: event.candidate, to });
        } else {
          console.warn("icecandidate: no 'to' available");
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("PC state:", pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        // close and reset
        try {
          pc.close();
        } catch (e) {}
        peerConnection = null;
      }
    };

    return pc;
  };

  return {
    getInstance: () => {
      if (!peerConnection) peerConnection = createPeerConnection();
      return peerConnection;
    },
    reset: () => {
      if (peerConnection) {
        try {
          peerConnection.close();
        } catch (e) {}
      }
      peerConnection = null;
    },
  };
})();

// ------- start call (with defensive checks) -------
const startCall = async (userSocketId) => {
  if (!userSocketId) {
    console.warn("No receiverSocketId — cannot start call");
    flashMessage.innerHTML = "Select a user to call";
    flashMessage.style.display = "block";
    setTimeout(() => (flashMessage.style.display = "none"), 3000);
    return;
  }

  // set caller pair: [callerSocketId, calleeSocketId]
  caller = [socket.id, userSocketId];

  const pc = PeerConnection.getInstance();
  // if localStream available, ensure tracks added (getInstance already adds but double-check)
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, localStream);
      } catch (e) {}
    });
  }

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  // emit with explicit to
  socket.emit("offer", {
    from: socket.id,
    to: userSocketId,
    offer: pc.localDescription,
  });
};

// ------- end call -------
const endCall = () => {
  // notify other side
  if (caller && caller.length === 2) {
    socket.emit("call-ended", caller);
  }
  PeerConnection.reset();
  videoContainer.style.display = "none";
  caller = [];
};

// UI bindings
videoCallBtn.addEventListener("click", (e) => {
  videoContainer.style.display = "block";
  startCall(receiverSocketId);
});

endCallBtn.addEventListener("click", (e) => {
  endCall();
});

// ------- socket handlers for offer/answer/ice -------
socket.on("offer", async ({ from, to, offer }) => {
  console.log("Received offer from", from);
  caller = [from, socket.id];

  videoContainer.style.display = "block";
  const pc = PeerConnection.getInstance();

  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", {
    from: socket.id,
    to: from,
    answer: pc.localDescription,
  });
});

socket.on("answer", async ({ from, to, answer }) => {
  console.log("Received answer from", from);
  const pc = PeerConnection.getInstance();
  await pc.setRemoteDescription(answer);
  // don't emit any end-call here
});

socket.on("icecandidate", async ({ candidate }) => {
  try {
    const pc = PeerConnection.getInstance();
    if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.error("addIceCandidate error:", err);
  }
});

socket.on("call-ended", (callerArr) => {
  console.log("call-ended for", callerArr);
  endCall();
  flashMessage.style.display = "block";
  flashMessage.innerHTML = "Call Ended";
  setTimeout(() => {
    flashMessage.style.display = "none";
    videoContainer.style.display = "none";
  }, 3000);
});

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