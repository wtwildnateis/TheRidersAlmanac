import { apiFetch } from "./client";

export async function uploadFlyer(file) {
  const form = new FormData();
  form.append("file", file); 

  const res = await apiFetch("/api/uploads/image", {
    method: "POST",
    body: form,
  });
  const json = await res.json(); // expects { url: "https://..." }
  return json.url;
}

export const uploadImage = uploadFlyer;
