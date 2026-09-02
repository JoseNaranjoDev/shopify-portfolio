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

const contactForm = document.getElementById("homepageContactForm");
const contactFormReadyAt = Date.now();

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("contact-msg");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const setMsg = (text, kind) => {
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.classList.remove("is-success", "is-error");
      if (kind) msgEl.classList.add(kind);
    };

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      website: formData.get("website") || "",
      startedAt: contactFormReadyAt,
    };

    if (submitBtn) submitBtn.disabled = true;
    setMsg("Sending...", "");

    try {
      const response = await fetch("/api/v1/contact-data/homepagecontactform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (result.success) {
        setMsg(result.message || "Message sent successfully!", "is-success");
        e.target.reset();
      } else {
        setMsg(result.message || "Failed to send message.", "is-error");
      }
    } catch (error) {
      setMsg("An error occurred. Please try again.", "is-error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
