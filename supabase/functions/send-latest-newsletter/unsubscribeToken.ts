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

const signSubscriberId = async (subscriberId: string, secret: string): Promise<string> => {
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
    encoder.encode(`newsletter-unsubscribe:${subscriberId}`),
  );
  return toBase64Url(new Uint8Array(signature));
};

export const createUnsubscribeToken = async (subscriberId: string, secret: string): Promise<string> => {
  const signature = await signSubscriberId(subscriberId, secret);
  return `${subscriberId}.${signature}`;
};

export const verifyUnsubscribeToken = async (
  token: string,
  secret: string,
): Promise<string | null> => {
  const separator = token.indexOf(".");
  if (separator <= 0) return null;
  const subscriberId = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  if (!/^[0-9a-f-]{36}$/i.test(subscriberId) || !suppliedSignature) return null;
  const expectedSignature = await signSubscriberId(subscriberId, secret);
  return timingSafeEqual(suppliedSignature, expectedSignature) ? subscriberId : null;
};
