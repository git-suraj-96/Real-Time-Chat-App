const visiblity = document.querySelectorAll(".visiblity");
const passwordBox = document.querySelectorAll(".password-box");
let isVisible = true;
visiblity.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    if (isVisible) {
      passwordBox[i].type = "text";
      isVisible = false;
    } else {
      passwordBox[i].type = "password";
      isVisible = true;
    }
  });
});

