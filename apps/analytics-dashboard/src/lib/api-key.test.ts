/**
 * Unit tests for API key generation.
 */
import { describe, it, expect } from 'vitest';
import { generateKey } from './api-key';

describe('generateKey', () => {
  it('returns a key starting with ak_', () => {
    const { key } = generateKey();
    expect(key).toMatch(/^ak_/);
  });

  it('returns keyHash and keyPrefix of expected length', () => {
    const { key, keyHash, keyPrefix } = generateKey();
    expect(key.length).toBeGreaterThan(10);
    expect(keyHash).toHaveLength(64); // sha256 hex
    expect(keyPrefix).toHaveLength(10);
    expect(key.startsWith(keyPrefix)).toBe(true);
  });

  it('generates unique keys', () => {
    const a = generateKey();
    const b = generateKey();
    expect(a.key).not.toBe(b.key);
    expect(a.keyHash).not.toBe(b.keyHash);
  });
});
