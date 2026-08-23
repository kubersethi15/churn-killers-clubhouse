const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const timingSafeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
};

const signRequest = async (requestId: string, expiresAt: number, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`newsletter-resubscribe:${requestId}:${expiresAt}`),
  );
  return toBase64Url(new Uint8Array(signature));
};

export const createReactivationToken = async (
  requestId: string,
  expiresAt: number,
  secret: string,
): Promise<string> => `${requestId}.${expiresAt}.${await signRequest(requestId, expiresAt, secret)}`;

export const verifyReactivationToken = async (
  token: string,
  secret: string,
  now = Date.now(),
): Promise<{ requestId: string; expiresAt: number } | null> => {
  const [requestId, rawExpiry, suppliedSignature, ...extra] = token.split(".");
  if (extra.length > 0 || !/^[0-9a-f-]{36}$/i.test(requestId) || !/^\d{10,13}$/.test(rawExpiry) || !suppliedSignature) {
    return null;
  }

  const expiresAt = Number(rawExpiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < now) return null;
  const expectedSignature = await signRequest(requestId, expiresAt, secret);
  return timingSafeEqual(suppliedSignature, expectedSignature) ? { requestId, expiresAt } : null;
};
