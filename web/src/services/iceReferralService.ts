/**
 * Covert ICE (In Case of Emergency) Referral & Invitation Service
 *
 * Provides cryptographically secure 256-bit single-use invitation tokens,
 * SHA-256 digest tracking, 72-hour TTL expiration, and neutral covert
 * share messages designed to withstand phone inspection by abusers.
 */

export type CovertShareTheme =
  | 'UTILITY_TRACKER'
  | 'FAMILY_CALENDAR'
  | 'COMMUNITY_GROCERY';

export interface IceReferralInvitation {
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  claimed: boolean;
  claimedAt?: string;
  contactLabel?: string;
  covertTheme: CovertShareTheme;
  claimedBy?: {
    name?: string;
    phone?: string;
  };
}

export interface CovertShareMessage {
  theme: CovertShareTheme;
  messageText: string;
  referralUrl: string;
}

export const ICE_INVITATION_STORAGE_KEY = 'umkhuseli_ice_invitations';
export const ICE_TOKEN_TTL_MS = 72 * 60 * 60 * 1000; // 72 Hours TTL

/**
 * Computes the SHA-256 hex digest of a string using Web Crypto API.
 */
export async function computeSha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a high-entropy 256-bit cryptographically secure token (64 hex characters).
 */
export function generate256BitToken(): string {
  const bytes = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates an innocent, covert sharing message avoiding any domestic violence
 * or emergency terminology to protect the user during hostile device scrutiny.
 */
export function formatCovertShareText(
  token: string,
  theme: CovertShareTheme = 'UTILITY_TRACKER',
  baseUrl?: string
): CovertShareMessage {
  const origin =
    baseUrl ||
    (typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://umkhuseli.app');
  const referralUrl = `${origin}?token=${encodeURIComponent(token)}`;

  let messageText = '';
  switch (theme) {
    case 'FAMILY_CALENDAR':
      messageText = `Hey! Here is our family calendar & schedule sync link: ${referralUrl}. Tap to connect your reminders.`;
      break;
    case 'COMMUNITY_GROCERY':
      messageText = `Hi! I created our shared grocery and household shopping list here: ${referralUrl}. Open to join the group.`;
      break;
    case 'UTILITY_TRACKER':
    default:
      messageText = `Hi! I've set up our shared household utility & prepaid electricity tracker. Click to link your phone so we can share token alerts: ${referralUrl}`;
      break;
  }

  return {
    theme,
    messageText,
    referralUrl,
  };
}

/**
 * In-memory storage fallback for non-browser or mock environments.
 */
let inMemoryStore: Record<string, IceReferralInvitation> = {};

function getStore(): Record<string, IceReferralInvitation> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(ICE_INVITATION_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return inMemoryStore;
    }
  }
  return inMemoryStore;
}

function saveStore(store: Record<string, IceReferralInvitation>): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        ICE_INVITATION_STORAGE_KEY,
        JSON.stringify(store)
      );
      return;
    } catch {
      // fallback to memory
    }
  }
  inMemoryStore = store;
}

/**
 * Creates and stores a new 72-hour single-use ICE referral invite.
 */
export async function createIceInvitation(options?: {
  contactLabel?: string;
  theme?: CovertShareTheme;
  baseUrl?: string;
  ttlMs?: number;
}): Promise<{
  rawToken: string;
  invitation: IceReferralInvitation;
  shareMessage: CovertShareMessage;
}> {
  const rawToken = generate256BitToken();
  const tokenHash = await computeSha256(rawToken);

  const now = Date.now();
  const ttl = options?.ttlMs ?? ICE_TOKEN_TTL_MS;
  const theme = options?.theme ?? 'UTILITY_TRACKER';

  const invitation: IceReferralInvitation = {
    tokenHash,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttl).toISOString(),
    claimed: false,
    contactLabel: options?.contactLabel || 'Primary Guardian',
    covertTheme: theme,
  };

  const store = getStore();
  store[tokenHash] = invitation;
  saveStore(store);

  const shareMessage = formatCovertShareText(rawToken, theme, options?.baseUrl);

  return {
    rawToken,
    invitation,
    shareMessage,
  };
}

export type IceVerificationStatus =
  | 'VALID'
  | 'EXPIRED'
  | 'CLAIMED'
  | 'NOT_FOUND'
  | 'INVALID_FORMAT';

export interface IceVerificationResult {
  status: IceVerificationStatus;
  isValid: boolean;
  invitation?: IceReferralInvitation;
  message: string;
}

/**
 * Verifies the validity of an ICE referral token.
 */
export async function verifyIceInvitation(
  rawToken: string
): Promise<IceVerificationResult> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length === 0) {
    return {
      status: 'INVALID_FORMAT',
      isValid: false,
      message: 'Token format is invalid or empty.',
    };
  }

  const tokenHash = await computeSha256(rawToken.trim());
  const store = getStore();
  const invitation = store[tokenHash];

  if (!invitation) {
    return {
      status: 'NOT_FOUND',
      isValid: false,
      message: 'Referral invitation not found or has been revoked.',
    };
  }

  if (invitation.claimed) {
    return {
      status: 'CLAIMED',
      isValid: false,
      invitation,
      message: 'This invitation token has already been claimed.',
    };
  }

  const now = Date.now();
  const expiryTime = new Date(invitation.expiresAt).getTime();
  if (now > expiryTime) {
    return {
      status: 'EXPIRED',
      isValid: false,
      invitation,
      message: 'This invitation link expired after 72 hours.',
    };
  }

  return {
    status: 'VALID',
    isValid: true,
    invitation,
    message: 'Referral token is verified and active.',
  };
}

/**
 * Atomically claims an ICE referral invitation, rendering it single-use.
 */
export async function claimIceInvitation(
  rawToken: string,
  responderDetails?: { name?: string; phone?: string }
): Promise<{
  success: boolean;
  status: IceVerificationStatus;
  invitation?: IceReferralInvitation;
  error?: string;
}> {
  const verification = await verifyIceInvitation(rawToken);
  if (!verification.isValid || !verification.invitation) {
    return {
      success: false,
      status: verification.status,
      error: verification.message,
    };
  }

  const tokenHash = await computeSha256(rawToken.trim());
  const store = getStore();
  const current = store[tokenHash];

  current.claimed = true;
  current.claimedAt = new Date().toISOString();
  if (responderDetails) {
    current.claimedBy = responderDetails;
  }

  store[tokenHash] = current;
  saveStore(store);

  return {
    success: true,
    status: 'VALID',
    invitation: current,
  };
}

/**
 * Clears in-memory and local storage (primarily for tests).
 */
export function clearAllInvitations(): void {
  inMemoryStore = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(ICE_INVITATION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
