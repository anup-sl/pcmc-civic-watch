export function isStaging(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes('staging') || host.includes('preview') || import.meta.env.VITE_APP_ENV === 'staging';
}

export const STAGING_EMAIL_RECIPIENT = 'anupsl.aws1@gmail.com';