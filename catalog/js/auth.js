(() => {
  const email = document.querySelector("[data-member-email]");
  const logoutButton = document.querySelector("[data-member-logout]");

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
