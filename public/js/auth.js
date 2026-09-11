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

function formatLastLogin(value) {
  if (!value) return "—";
  const raw = String(value).trim();
  const asUtc = /Z$|[+-]\d{2}:?\d{2}$/.test(raw)
    ? raw
    : raw.includes("T")
      ? `${raw}Z`
      : `${raw.replace(" ", "T")}Z`;
  const d = new Date(asUtc);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderAdminOverview(overview) {
  const analytics = overview.data.analytics || {};
  const visits = analytics.visits || {};
  const logins = analytics.logins || {};
  const windows = analytics.windows || {};

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("visits-today", visits.today ?? 0);
  setText("visits-7d", visits.last7Days ?? 0);
  setText("visits-30d", visits.last30Days ?? 0);
  setText("logins-today", logins.today ?? 0);
  setText("logins-7d", logins.last7Days ?? 0);
  setText("logins-30d", logins.last30Days ?? 0);

  const windowsEl = document.getElementById("stats-windows");
  if (windowsEl) {
    windowsEl.textContent = [
      windows.today || "Today (UTC calendar day)",
      windows.last7Days || "Last 7 days (rolling)",
      windows.last30Days || "Last 30 days (rolling)",
    ].join(" · ");
  }

  const tbody = document.querySelector("#users tbody");
  if (!tbody) return;
  tbody.innerHTML = (overview.data.users || [])
    .map(
      (row) =>
        `<tr><td>${row.name || ""}</td><td>${row.email || ""}</td><td>${
          row.role || ""
        }</td><td>${formatLastLogin(row.last_login_at)}</td></tr>`
    )
    .join("");
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
    const nameEl = document.getElementById("member-name");
    if (nameEl) {
      nameEl.textContent = u.name || "there";
    }
    who.textContent = u.role === "admin" ? "Administrator" : "Signed in as a member";
    if (location.pathname === "/admin") {
      if (u.role !== "admin") {
        location.href = "/account";
        return;
      }
      const overview = await api("/api/v1/users/admin-overview");
      renderAdminOverview(overview);
    }
    if (location.pathname === "/account" && u.role === "admin") {
      location.href = "/admin";
    }
  } catch (err) {
    location.href = "/login";
  }
}
bootAccount();
