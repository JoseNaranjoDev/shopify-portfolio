(function () {
  const loginGlyph =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const accountGlyph =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  const links = document.querySelectorAll("[data-nav-auth]");
  if (!links.length) return;

  function apply(href, label, glyph) {
    links.forEach(function (a) {
      a.setAttribute("href", href);
      a.setAttribute("aria-label", label);
      a.innerHTML = glyph;
    });
  }

  apply("/login", "Log in", loginGlyph);

  fetch("/api/v1/users/me", { credentials: "include" })
    .then(function (res) {
      if (res.status === 401 || !res.ok) return null;
      return res.json();
    })
    .then(function (data) {
      var user = data && data.data && data.data.user;
      if (!user) return;
      var dest = user.role === "admin" ? "/admin" : "/account";
      apply(dest, "Account", accountGlyph);
    })
    .catch(function () {});
})();
