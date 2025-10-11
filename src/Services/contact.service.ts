export type ContactPayload = { name: string; email: string; message: string };

export async function sendContact(payload: ContactPayload) {
  // mock: guarda no localStorage e resolve
  const key = "contact_messages";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.push({ ...payload, createdAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(prev));
  await new Promise(r => setTimeout(r, 400));
  return true;
}
