(() => {
  const identity = window.netlifyIdentity;
  const params = new URLSearchParams(window.location.search);
  const tabs = [...document.querySelectorAll("[data-auth-tab]")];
  const loginPanel = document.getElementById("loginPanel");
  const requestPanel = document.getElementById("requestPanel");
  const loginForm = document.getElementById("loginForm");
  const requestForm = document.getElementById("requestForm");
  const loginButton = document.getElementById("loginButton");
  const loginButtonText = document.getElementById("loginButtonText");
  const requestButton = document.getElementById("requestButton");
  const loginStatus = document.getElementById("loginStatus");
  const requestStatus = document.getElementById("requestStatus");
  const password = document.getElementById("loginPassword");
  const passwordToggle = document.getElementById("passwordToggle");
  const wasRejected = params.get("reason") === "auth";

  const showStatus = (element, message, isError = false) => {
    element.textContent = message;
    element.hidden = false;
    element.classList.toggle("is-error", isError);
  };

  const setTab = name => {
    const isLogin = name === "login";
    loginPanel.hidden = !isLogin;
    requestPanel.hidden = isLogin;
    tabs.forEach(tab => {
      const active = tab.dataset.authTab === name;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
  };

  const goToCatalog = () => window.location.replace("/catalog/");

  const getServerUser = async () => {
    const response = await fetch("/.netlify/functions/me", { credentials: "same-origin" });
    if (!response.ok) return null;
    return response.json();
  };

  const clearServerSession = async () => {
    try {
      await fetch("/.netlify/functions/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}
  };

  const clearWidgetSession = async () => {
    try {
      if (identity?.currentUser()) await identity.logout();
    } catch {}
  };

  const verifyAndEnter = async () => {
    try {
      const user = await getServerUser();
      if (user?.roles?.includes("member")) {
        goToCatalog();
        return true;
      }
    } catch {}
    return false;
  };

  tabs.forEach(tab => tab.addEventListener("click", () => setTab(tab.dataset.authTab)));

  if (wasRejected) {
    showStatus(loginStatus, "登入狀態已過期，正在為你重新整理…", true);
  }
  if (params.get("request") === "sent") {
    setTab("request");
    showStatus(requestStatus, "申請已送出。我們確認身分後，會寄送會員邀請信。", false);
  }

  const prepareSession = async () => {
    if (wasRejected) {
      // A stale Identity widget user can disagree with Netlify's secure session
      // cookie. Clear both sides once so the page cannot enter a redirect loop.
      await Promise.all([clearServerSession(), clearWidgetSession()]);
      window.history.replaceState({}, "", window.location.pathname);
      showStatus(loginStatus, "登入狀態已更新，請重新登入。", false);
      return;
    }
    await verifyAndEnter();
  };

  prepareSession();

  if (identity) {
    // Do not redirect from the widget's local user record. Chrome may retain an
    // expired record in localStorage; protected pages trust the server session.
    identity.on("login", async () => {
      identity.close();
      if (!(await verifyAndEnter())) {
        await clearWidgetSession();
        showStatus(loginStatus, "請使用下方表單重新登入，以更新安全憑證。", true);
      }
    });
    identity.on("error", error => showStatus(loginStatus, error?.message || "驗證發生問題，請稍後再試。", true));
  }

  passwordToggle.addEventListener("click", () => {
    const reveal = password.type === "password";
    password.type = reveal ? "text" : "password";
    passwordToggle.textContent = reveal ? "隱藏" : "顯示";
    passwordToggle.setAttribute("aria-label", reveal ? "隱藏密碼" : "顯示密碼");
  });

  document.getElementById("recoveryButton").addEventListener("click", () => {
    if (identity) identity.open("login");
    else showStatus(loginStatus, "密碼重設服務尚未載入，請重新整理後再試。", true);
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginStatus.hidden = true;
    loginButton.disabled = true;
    loginButtonText.textContent = "驗證中…";

    try {
      const response = await fetch("/.netlify/functions/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("loginEmail").value.trim(),
          password: password.value,
        }),
      });

      if (!response.ok) throw new Error(response.status === 401 ? "信箱或密碼不正確。" : "目前無法登入，請稍後再試。");
      const user = await getServerUser();
      if (!user) throw new Error("登入憑證未能建立，請重新整理後再試。");
      if (!user.roles?.includes("member")) {
        await clearServerSession();
        throw new Error("帳號已登入，但尚未取得使用權，請聯絡管理者。");
      }
      showStatus(loginStatus, "登入成功，正在進入專屬工具庫…");
      window.setTimeout(goToCatalog, 250);
    } catch (error) {
      showStatus(loginStatus, error.message || "目前無法登入，請稍後再試。", true);
      loginButton.disabled = false;
      loginButtonText.textContent = "登入專屬工具庫";
    }
  });

  requestForm.addEventListener("submit", async event => {
    event.preventDefault();
    requestStatus.hidden = true;
    requestButton.disabled = true;

    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      showStatus(requestStatus, "本機預覽不會送出資料；部署到 Netlify 後即可正式申請。", false);
      requestButton.disabled = false;
      return;
    }

    try {
      const body = new URLSearchParams(new FormData(requestForm));
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!response.ok) throw new Error();
      requestForm.reset();
      showStatus(requestStatus, "申請已送出。我們確認身分後，會寄送會員邀請信。", false);
    } catch {
      showStatus(requestStatus, "申請暫時無法送出，請稍後再試。", true);
    } finally {
      requestButton.disabled = false;
    }
  });
})();
