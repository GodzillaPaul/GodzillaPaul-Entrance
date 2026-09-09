(() => {
  const email = document.querySelector("[data-member-email]");
  const logoutButton = document.querySelector("[data-member-logout]");
  const isLocalPreview = window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  // 本機與 ZIP 預覽沒有 Netlify Functions；略過驗證只為方便檢查版面。
  // 正式部署仍由 Netlify CDN 的 /catalog/* 角色規則保護。
  if (isLocalPreview) {
    if (email) email.textContent = "本機預覽";
    if (logoutButton) logoutButton.hidden = true;
    return;
  }

  fetch("/.netlify/functions/me", { credentials: "same-origin" })
    .then(response => {
      if (!response.ok) throw new Error("unauthorized");
      return response.json();
    })
    .then(user => {
      if (!user.roles?.includes("member")) throw new Error("unauthorized");
      if (email) email.textContent = user.email || "已登入會員";
    })
    .catch(() => window.location.replace("/?reason=auth"));

  logoutButton?.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
      await fetch("/.netlify/functions/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      window.location.replace("/");
    }
  });
})();
