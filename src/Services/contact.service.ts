// src/Services/contact.service.ts
export type ContactPayload = { name: string; email: string; message: string };

export async function sendContact(payload: ContactPayload) {
  const res = await fetch("/api/public/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Falha ao enviar");
  return true;
}
