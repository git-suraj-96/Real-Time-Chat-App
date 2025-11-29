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
