const msgEl = document.getElementById("msg");
const setMsg = (text, ok) => {
  if (!msgEl) return;
  msgEl.textContent = text || "";
  msgEl.style.color = ok ? "#9f7" : "#f66";
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {}
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  const params = new URLSearchParams(location.search);
  if (params.get("mode") === "signup") {
    loginForm.outerHTML = `
      <form id="signup-form">
        <label>Name</label>
        <input type="text" name="name" required minlength="3" />
        <label>Email</label>
        <input type="email" name="email" required autocomplete="email" />
        <label>Password</label>
        <input type="password" name="password" required minlength="8" autocomplete="new-password" />
        <label>Confirm password</label>
        <input type="password" name="passwordConfirm" required minlength="8" autocomplete="new-password" />
        <button type="submit">Create account</button>
      </form>`;
    document.querySelector(".auth-switch").innerHTML =
      'Already have an account? <a href="/login">Log in</a>';
    document.querySelector("h1").textContent = "Member signup";
    document.getElementById("signup-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      setMsg("");
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      try {
        const data = await api("/api/v1/users/signup", {
          method: "POST",
          body: JSON.stringify(body),
        });
        location.href = data.data.user.role === "admin" ? "/admin" : "/account";
      } catch (err) {
        setMsg(err.message);
      }
    });
  } else {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMsg("");
      const fd = new FormData(loginForm);
      const body = Object.fromEntries(fd.entries());
      try {
        const data = await api("/api/v1/users/login", {
          method: "POST",
          body: JSON.stringify(body),
        });
        location.href = data.data.user.role === "admin" ? "/admin" : "/account";
      } catch (err) {
        setMsg(err.message);
      }
    });
  }
}

const setupForm = document.getElementById("setup-form");
if (setupForm) {
  setupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");
    const body = Object.fromEntries(new FormData(setupForm).entries());
    try {
      await api("/api/v1/users/setup", {
        method: "POST",
        body: JSON.stringify(body),
      });
      location.href = "/admin";
    } catch (err) {
      setMsg(err.message);
    }
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await api("/api/v1/users/logout");
    location.href = "/login";
  });
}

async function bootAccount() {
  const who = document.getElementById("who");
  if (!who || !logoutBtn) return;
  if (location.pathname === "/login" || location.pathname === "/setup") return;
  try {
    const data = await api("/api/v1/users/me");
    const u = data.data.user;
    who.textContent = `${u.name} · ${u.email} · ${u.role}`;
    if (location.pathname === "/admin") {
      if (u.role !== "admin") {
        location.href = "/account";
        return;
      }
      const overview = await api("/api/v1/users/admin-overview");
      const tbody = document.querySelector("#users tbody");
      tbody.innerHTML = overview.data.users
        .map(
          (row) =>
            `<tr><td>${row.name}</td><td>${row.email}</td><td>${row.role}</td></tr>`
        )
        .join("");
    }
    if (location.pathname === "/account" && u.role === "admin") {
      location.href = "/admin";
    }
  } catch (err) {
    location.href = "/login";
  }
}
bootAccount();
