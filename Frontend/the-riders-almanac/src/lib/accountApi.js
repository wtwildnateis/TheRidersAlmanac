async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json().catch(() => ({}));
}

export const accountApi = {
  changePassword: (currentPassword, newPassword) =>
    postJSON("/api/account/change-password", { currentPassword, newPassword }),

  changeUsername: (newUsername) =>
    postJSON("/api/account/change-username", { newUsername }),

  changeEmail: (newEmail) =>
    postJSON("/api/account/change-email", { newEmail }),
};