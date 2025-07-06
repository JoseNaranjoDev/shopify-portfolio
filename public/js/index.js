const hamburgerIcon = document.getElementById("hamburger-icon");
const closeX = document.getElementById("closeX");
const links = document.getElementsByClassName("link");
const videoSource = document.getElementById("video-source");

hamburgerIcon.addEventListener("click", function () {
  const navLinksMobile = document.getElementById("nav-links-mobile");
  navLinksMobile.classList.add("nav-links-mobile");
  navLinksMobile.classList.remove("hidden");
});

closeX.addEventListener("click", function () {
  const navLinksMobile = document.getElementById("nav-links-mobile");
  navLinksMobile.classList.remove("nav-links-mobile");
  navLinksMobile.classList.add("hidden");
});

for (var link of links) {
  link.addEventListener("click", function () {
    const navLinksMobile = document.getElementById("nav-links-mobile");
    navLinksMobile.classList.add("hidden");
    navLinksMobile.classList.remove("nav-links-mobile");
  });
}

if (window.innerWidth < 780) {
  videoSource.setAttribute("src", "../video/portfolio-cta-small.mp4");
}
if (window.innerWidth >= 780) {
  videoSource.setAttribute("src", "../video/portfolio-cta.mp4");
}

document.addEventListener("DOMContentLoaded", function () {
  const profileBox = document.getElementById("profile-box");
  const profileImg = profileBox.querySelector("img");
  profileImg.style.display = "block";
});
