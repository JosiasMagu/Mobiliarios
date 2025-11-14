// src/lib/e2.client.ts
import axios from "axios";

const BASE = process.env.E2_BASE ?? "https://e2payments.explicador.co.mz";
const CLIENT_ID = process.env.E2_CLIENT_ID!;
const CLIENT_SECRET = process.env.E2_CLIENT_SECRET!;

type TokenCache = { token: string; exp: number } | null;
let cache: TokenCache = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cache && now < cache.exp - 30_000) return cache.token;

  try {
    const { data } = await axios.post(`${BASE}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }, { timeout: 60000 }); // 60s para emissão de token

    const token = `${data.token_type} ${data.access_token}`;
    const ttl = (data.expires_in ?? 3600) * 1000;
    cache = { token, exp: now + ttl };
    return token;
  } catch (err: any) {
    const code = err?.response?.status;
    const body = err?.response?.data;
    console.error("e2 getToken error:", code, JSON.stringify(body ?? err?.message));
    throw new Error(body?.message || body?.error || err?.message || "e2 token failed");
  }
}

function headers(token: string) {
  return { Authorization: token, Accept: "application/json", "Content-Type": "application/json" };
}

// C2B
export async function e2C2BPay(p: { walletId: string|number; amount: number; phone: string; reference: string; }) {
  const token = await getToken();
  const url = `${BASE}/v1/c2b/mpesa-payment/${p.walletId}`;
  const payload = {
    client_id: CLIENT_ID,
    amount: String(p.amount),
    phone: p.phone,
    reference: p.reference.replace(/\s+/g, ""),
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: headers(token),
      timeout: 60000, // 60s para esperar o gateway
    });
    return data;
  } catch (err: any) {
    const code = err?.response?.status;
    const body = err?.response?.data;
    console.error("e2C2BPay error:", code, JSON.stringify(body ?? err?.message));
    throw new Error(body?.message || body?.error || err?.message || "e2 c2b failed");
  }
}

export async function e2ListWallets() {
  const token = await getToken();
  const url = `${BASE}/v1/wallets/mpesa/get/all`;
  try {
    const { data } = await axios.post(url, { client_id: CLIENT_ID }, {
      headers: headers(token),
      timeout: 20000,
    });
    return data;
  } catch (err: any) {
    const code = err?.response?.status;
    const body = err?.response?.data;
    console.warn("e2ListWallets warn:", code, JSON.stringify(body ?? err?.message));
    if (code === 404) return [];
    throw new Error(body?.message || body?.error || err?.message || "wallets failed");
  }
}

export async function e2ListPaymentsAll() {
  const token = await getToken();
  const url = `${BASE}/v1/payments/mpesa/get/all`;
  const { data } = await axios.post(url, { client_id: CLIENT_ID }, {
    headers: headers(token),
    timeout: 20000,
  });
  return data;
}

export async function e2ListPaymentsPaginate(qty: number) {
  const token = await getToken();
  const url = `${BASE}/v1/payments/mpesa/get/all/paginate/${qty}`;
  const { data } = await axios.post(url, { client_id: CLIENT_ID }, {
    headers: headers(token),
    timeout: 20000,
  });
  return data;
}
