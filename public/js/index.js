const hamburgerIcon = document.getElementById("hamburger-icon");
// CONTACT FORM SECURE BOX
const hiddenInput = document.getElementById("contact_email");
const submitBtn = document.getElementById("contact_submit_btn");
const disabledBtn = document.getElementById("disabled_btn");
const formCheckBox = document.querySelector("#not_a_robot");
const formBox = document.querySelector("#form_box");

formCheckBox.addEventListener("change", function () {
  if (this.checked && hiddenInput.value.length == 0) {
    //<button class="hidden" id="contact_submit_btn" type="submit" name="submit">SEND</button>
    const sendBtn = document.createElement("button");
    sendBtn.setAttribute("type", "submit");
    sendBtn.setAttribute("id", "contact_submit_btn");
    sendBtn.setAttribute("name", "submit");
    sendBtn.textContent = "SEND";
    formBox.appendChild(sendBtn);
    disabledBtn.classList.add("hidden");
  } else {
    let d = document.getElementById("form_box");
    let d_nested = document.getElementById("contact_submit_btn");
    d.removeChild(d_nested);
    disabledBtn.classList.remove("hidden");
  }
});

hamburgerIcon.addEventListener("click", function () {
  const navLinksMobile = document.getElementById("nav-links-mobile");
  navLinksMobile.classList.add("nav-links-mobile");
  navLinksMobile.classList.remove("hidden");
});
const closeX = document.getElementById("closeX");
closeX.addEventListener("click", function () {
  const navLinksMobile = document.getElementById("nav-links-mobile");
  navLinksMobile.classList.remove("nav-links-mobile");
  navLinksMobile.classList.add("hidden");
});
const links = document.getElementsByClassName("link");

for (var link of links) {
  link.addEventListener("click", function () {
    const navLinksMobile = document.getElementById("nav-links-mobile");
    navLinksMobile.classList.add("hidden");
    navLinksMobile.classList.remove("nav-links-mobile");
  });
}

const videoSource = document.getElementById("video-source");

if (window.innerWidth < 780) {
  videoSource.setAttribute("src", "../video/portfolio-cta-small.mp4");
}
if (window.innerWidth >= 780) {
  videoSource.setAttribute("src", "../video/portfolio-cta.mp4");
}
