// Imports
const socket = io("http://localhost:5000");

// Emit events to the server
socket.emit("connection", "Hello, server!");

// ===================================
// References from html
// ===================================
// Pages References
let loginPage = document.getElementById("login-page");
let homePage = document.getElementById("home-page");

// Form references
let loginButton = document.getElementById("login-button");
let msgbtn = document.getElementById("msg-btn");
let toggleBtn = document.getElementById("name-section-toggle");

// Other references
let chatContainer = document.getElementById("chat-container");
let user,
  userColor,
  nameToggle = false; // user to get the username, userColor for the color with the user, nameToggle is to toggle name section

// add the message to the container
const addMessagetoContainer = (message, name, type) => {
  // create new div for the text and setting its message align and appending to chat container
  let newMsg = document.createElement("div");
  newMsg.classList = type;

  let avatarBox = document.createElement("div");
  avatarBox.classList = "avatar-box";

  if (type === "message my-msg") {
    let avatar = name.split(" ").reduce((acc, val) => {
      return acc.toLocaleUpperCase() + "" + val[0].toLocaleUpperCase();
    }, "");
    avatarBox.innerHTML = `<span class="avatar" style="background-color: #40e0d0; color: white;">${avatar}</span>`;
  } else {
    avatarBox.style.left = "-32px";

    let avatar = name["name"].split(" ").reduce((acc, val) => {
      return acc.toLocaleUpperCase() + "" + val[0].toLocaleUpperCase();
    }, "");
    avatarBox.innerHTML = `<span class="avatar" style="background-color: ${name.color}; color: white;">${avatar}</span>`;
  }

  newMsg.append(avatarBox);
  newMsg.innerHTML += message;
  chatContainer.append(newMsg);
};

// adding the left and joining message on the chat
const addJoinLefttoContainer = (message, type) => {
  let newMsg = document.createElement("div");
  newMsg.classList = type;
  newMsg.innerHTML = `<small>${message}</small>`;

  chatContainer.append(newMsg);
};

// adding the users to the members container
const addUsersToDom = (usersList) => {
  let membersDiv = document.getElementById("members");
  membersDiv.innerHTML = "";

  usersList.forEach((user) => {
    let userElm = document.createElement("div");
    userElm.classList = "person";

    let avatarElm = document.createElement("span");
    avatarElm.classList = "avatar";
    avatarElm.style.backgroundColor = user.color;

    let avatar = user.name.split(" ").reduce((acc, val) => {
      return acc.toLocaleUpperCase() + "" + val[0].toLocaleUpperCase();
    }, "");

    avatarElm.textContent = avatar;

    userElm.append(avatarElm);
    userElm.innerHTML += user.name;
    membersDiv.append(userElm);
  });
};

// ===================================
// Event listeners
// ===================================

// On submit the login form event listener
loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  // Get the login and create socket event
  let username = document.getElementById("user-name-input").value;
  username = `${username.charAt(0).toLocaleUpperCase()}${username.slice(1)}`;
  user = username;

  if (username.length) {
    // Submit form from here
    socket.emit("new-user-added", username);
    socket.emit("make-users-arr");
    socket.emit("make-users-arr-for-new");

    // adding user Profile over here

    document.getElementById(
      "me-profile"
    ).innerHTML = `<i class="fa-solid fa-user"></i>${username}`;

    // on submit display home and hide login
    loginPage.style.display = "none";
    homePage.style.display = "flex";
  }
});

// On sending the message form event listener
msgbtn.addEventListener("click", (e) => {
  e.preventDefault();
  let myMsg = document.getElementById("user-msg-input");

  if (myMsg.value.trim().length > 0) {
    addMessagetoContainer(myMsg.value, user, "message my-msg");
    socket.emit("send-message", myMsg.value);
    myMsg.value = "";
  }
});

toggleBtn.addEventListener("click", () => {
  let nameSection = document.querySelector(" .name-section");

  toggleBtn = !toggleBtn;

  if (toggleBtn) {
    nameSection.style.left = "0";
    toggleBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  } else {
    nameSection.style.left = "-800px";
    toggleBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
  }
});

// ===================================
// Socket.io event listeners
// ===================================

// When the user newly entered chat
socket.on("user-added", (user) => {
  socket.emit("get-users");
  addJoinLefttoContainer(`${user} joins.`, "in-left-msg");
});

// Receiving the message
socket.on("receive-message", (message) => {
  addMessagetoContainer(message.msg, message.user, "message other-msg");
});

// When a user left the chat
socket.on("left-message", (user) => {
  addJoinLefttoContainer(`${user.name} left.`, "in-left-msg");
});

// Trying to get users
socket.on("get-users", (arr) => {
  // adding users to the members
  addUsersToDom(arr);
  // adding total online people
  document.getElementById("total-count").textContent = `${arr.length} Online`;
});
