export const WELCOME_CLAIM_WINDOW_MS = 15 * 60 * 1000;

export interface WelcomeSubscriberState {
  subscribed: boolean;
  created_at: string;
  welcome_email_sent_at: string | null;
}

export const welcomeCutoffIso = (now = new Date()): string =>
  new Date(now.getTime() - WELCOME_CLAIM_WINDOW_MS).toISOString();

export const isWelcomeEligible = (
  subscriber: WelcomeSubscriberState | null | undefined,
  now = new Date(),
): boolean => {
  if (!subscriber?.subscribed || subscriber.welcome_email_sent_at) return false;
  const createdAt = Date.parse(subscriber.created_at);
  if (!Number.isFinite(createdAt)) return false;
  const age = now.getTime() - createdAt;
  return age >= -60_000 && age <= WELCOME_CLAIM_WINDOW_MS;
};
