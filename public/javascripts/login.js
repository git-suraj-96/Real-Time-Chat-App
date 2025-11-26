const visible = document.querySelector(".visible-btn");
const passwordBox = document.querySelector(".password-box");
let isVisible = true;

visible.addEventListener("click", () => {
    if(isVisible){
        passwordBox.type = "text";
        isVisible = false;
    }else{
        passwordBox.type = "password";
        isVisible = true;
    }
})