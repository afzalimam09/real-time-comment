let username;
let socket = io();

do {
  username = prompt("Enter your name");
} while (!username);

const textarea = document.querySelector("#textarea");
const submitBtn = document.querySelector("#submit-btn");
const commentBox = document.querySelector(".comment-box");

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let comment = textarea.value;
  if (!comment) {
    return;
  }
  postComment(comment);
});

function postComment(comment) {
  //append to dom
  let data = {
    username: username,
    comment: comment,
  };
  appendToDom(data);

  //Broadcast
  broadcastComment(data);

  //Sync with MongoDB
  syncWithDB(data);
}

function appendToDom(data) {
  let lTag = document.createElement("li");
  lTag.classList.add("comment");

  let markup = `
            <div class="comment-body border-light">
                <h6>${data.username}</h6>
                <p>
                ${data.comment}
                </p>
                <div>
                <small>${moment(data.time).format("LT")}</small>
                </div>
            </div>

    `;
  lTag.innerHTML = markup;
  commentBox.prepend(lTag);
  textarea.value = "";
}

function broadcastComment(data) {
  socket.emit("comment", data);
}

socket.on("comment", (data) => {
  appendToDom(data);
});

let timerId = null;
function debaunce(func, timer) {
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
    func();
  }, timer);
}

const typingDiv = document.querySelector(".typing");

socket.on("typing", (data) => {
  typingDiv.innerHTML = `${data.username} is typing...`;
  debaunce(function () {
    typingDiv.innerHTML = "";
  }, 1000);
});

//Event listener on textarea

textarea.addEventListener("keyup", (e) => {
  socket.emit("typing", { username });
});

function syncWithDB(data) {
  const headers = {
    "Content-Type": "application/json",
  };

  fetch("/api/comments", {
    method: "Post",
    body: JSON.stringify(data),
    headers,
  })
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
    });
}

function fetchComment() {
  fetch("/api/comments")
    .then((res) => res.json())
    .then((result) => {
        result.forEach((comment) => {
            comment.time = comment.createdAt;
            appendToDom(comment);
        })
    });
}


window.onload = fetchComment;