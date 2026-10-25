import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generate256BitToken,
  computeSha256,
  formatCovertShareText,
  createIceInvitation,
  verifyIceInvitation,
  claimIceInvitation,
  clearAllInvitations,
  ICE_TOKEN_TTL_MS,
} from '../services/iceReferralService';

describe('Covert ICE Referral Service', () => {
  beforeEach(() => {
    clearAllInvitations();
    vi.restoreAllMocks();
  });

  describe('Cryptographic Token & SHA-256 Digest Generation', () => {
    it('generates a 256-bit high-entropy token (64 hex characters)', () => {
      const token = generate256BitToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);

      const token2 = generate256BitToken();
      expect(token).not.toEqual(token2);
    });

    it('computes accurate SHA-256 digests', async () => {
      const hash1 = await computeSha256('test-token-123');
      expect(hash1).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);

      const hash2 = await computeSha256('test-token-123');
      expect(hash1).toBe(hash2);

      const hash3 = await computeSha256('test-token-456');
      expect(hash1).not.toBe(hash3);
    });
  });

  describe('Covert Share Text Formatting (Hostile Inspection Evasion)', () => {
    it('formats innocent utility tracker message by default without safety keywords', () => {
      const token = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      const share = formatCovertShareText(token, 'UTILITY_TRACKER', 'https://safe.co.za');

      expect(share.referralUrl).toBe(`https://safe.co.za?token=${token}`);
      expect(share.messageText).toContain('household utility & prepaid electricity tracker');
      expect(share.messageText).toContain(share.referralUrl);

      // Verify no safety/distress keywords are exposed
      const lower = share.messageText.toLowerCase();
      expect(lower).not.toContain('violence');
      expect(lower).not.toContain('abuse');
      expect(lower).not.toContain('emergency');
      expect(lower).not.toContain('sos');
      expect(lower).not.toContain('rescue');
    });

    it('supports family calendar and grocery sync covert disguises', () => {
      const token = '12345';
      const calShare = formatCovertShareText(token, 'FAMILY_CALENDAR');
      expect(calShare.messageText).toContain('family calendar & schedule sync');

      const grocShare = formatCovertShareText(token, 'COMMUNITY_GROCERY');
      expect(grocShare.messageText).toContain('grocery and household shopping list');
    });
  });

  describe('Invitation Creation, Verification, Expiration & Single-Use Claiming', () => {
    it('creates an invitation with a 72-hour TTL and stores it safely', async () => {
      const created = await createIceInvitation({
        contactLabel: 'Trusted Sister',
        theme: 'UTILITY_TRACKER',
      });

      expect(created.rawToken).toHaveLength(64);
      expect(created.invitation.claimed).toBe(false);
      expect(created.invitation.contactLabel).toBe('Trusted Sister');
      expect(created.invitation.covertTheme).toBe('UTILITY_TRACKER');

      const createdTime = new Date(created.invitation.createdAt).getTime();
      const expiryTime = new Date(created.invitation.expiresAt).getTime();
      expect(expiryTime - createdTime).toBe(ICE_TOKEN_TTL_MS);
    });

    it('verifies an active invitation successfully', async () => {
      const { rawToken } = await createIceInvitation();
      const verification = await verifyIceInvitation(rawToken);

      expect(verification.isValid).toBe(true);
      expect(verification.status).toBe('VALID');
      expect(verification.invitation).toBeDefined();
    });

    it('rejects unknown or invalid tokens', async () => {
      const unknownToken = generate256BitToken();
      const result = await verifyIceInvitation(unknownToken);

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('NOT_FOUND');

      const emptyResult = await verifyIceInvitation('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.status).toBe('INVALID_FORMAT');
    });

    it('rejects expired invitations after 72 hours', async () => {
      // Create invitation with negative TTL (already expired)
      const { rawToken } = await createIceInvitation({ ttlMs: -1000 });
      const verification = await verifyIceInvitation(rawToken);

      expect(verification.isValid).toBe(false);
      expect(verification.status).toBe('EXPIRED');
    });

    it('claims an invitation once and strictly prevents reuse (single-use enforcement)', async () => {
      const { rawToken } = await createIceInvitation({
        contactLabel: 'Neighbour Ayanda',
      });

      // Claim #1
      const claimResult = await claimIceInvitation(rawToken, {
        name: 'Ayanda Nkosi',
        phone: '+27821234567',
      });

      expect(claimResult.success).toBe(true);
      expect(claimResult.status).toBe('VALID');
      expect(claimResult.invitation?.claimed).toBe(true);
      expect(claimResult.invitation?.claimedBy?.name).toBe('Ayanda Nkosi');

      // Claim #2 (must fail because it is single-use)
      const secondClaim = await claimIceInvitation(rawToken, {
        name: 'Attacker or Interceptor',
      });

      expect(secondClaim.success).toBe(false);
      expect(secondClaim.status).toBe('CLAIMED');

      // Subsequent verification also returns CLAIMED
      const verAfter = await verifyIceInvitation(rawToken);
      expect(verAfter.isValid).toBe(false);
      expect(verAfter.status).toBe('CLAIMED');
    });
  });
});
