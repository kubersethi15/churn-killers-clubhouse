export type ResendTags = Record<string, string> | Array<{ name: string; value: string }>;

export const tagValue = (tags: ResendTags | undefined, name: string): string | null => {
  if (!tags) return null;
  if (Array.isArray(tags)) return tags.find(tag => tag.name === name)?.value ?? null;
  const value = tags[name];
  return typeof value === "string" && value.length > 0 ? value : null;
};

export const shouldSuppressSubscriber = (eventType: string, bounceType?: string): boolean => {
  if (eventType === "email.complained") return true;
  if (eventType !== "email.bounced") return false;

  // Resend documents email.bounced as a permanent rejection. Retain the
  // conservative legacy behaviour if older payloads omit bounce.type, while
  // avoiding unsubscribe on an explicitly temporary delivery failure.
  const normalizedBounceType = (bounceType ?? "").trim().toLowerCase();
  return normalizedBounceType === "" || normalizedBounceType === "permanent";
};
