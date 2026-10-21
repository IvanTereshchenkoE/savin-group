import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password';

describe('Password Hashing and Verification', () => {
  it('hashes a password and verifies it successfully', async () => {
    const raw = 'SuperSecret123!';
    const hash = await hashPassword(raw);

    expect(hash).toContain(':');
    const isValid = await verifyPassword(raw, hash);
    expect(isValid).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const raw = 'CorrectPassword';
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('rejects malformed hashes safely', async () => {
    expect(await verifyPassword('test', '')).toBe(false);
    expect(await verifyPassword('test', 'nohashhere')).toBe(false);
    expect(await verifyPassword('test', ':')).toBe(false);
    expect(await verifyPassword('test', 'salt:shortkey')).toBe(false);
  });
});
