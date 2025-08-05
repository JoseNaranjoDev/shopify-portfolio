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

//Contact Form Handler
document
  .getElementById("homepageContactForm")
  .addEventListener("submit", async (e) => {
    console.log("form event happening!");
    e.preventDefault(); // Prevent page reload
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/v1/contact-data/homepagecontactform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message); // Show success alert
        e.target.reset(); // Optional: Reset form
      } else {
        alert(result.message); // Show error alert
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  });
