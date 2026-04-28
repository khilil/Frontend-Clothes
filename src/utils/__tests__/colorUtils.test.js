import { describe, it, expect } from 'vitest';
import { getMainColorFromHex, normalizeHex } from '../colorUtils';

describe('colorUtils', () => {
  describe('getMainColorFromHex', () => {
    it('identifies extreme neutrals', () => {
      expect(getMainColorFromHex('#000000')).toBe('BLACK');
      expect(getMainColorFromHex('#FFFFFF')).toBe('WHITE');
    });

    it('identifies RED correctly', () => {
      expect(getMainColorFromHex('#FF0000')).toBe('RED');
      expect(getMainColorFromHex('#FF3333')).toBe('RED');
    });

    it('identifies BLUE correctly', () => {
      expect(getMainColorFromHex('#0000FF')).toBe('BLUE');
      expect(getMainColorFromHex('#3333FF')).toBe('BLUE');
    });

    it('identifies GREEN correctly', () => {
      expect(getMainColorFromHex('#00FF00')).toBe('GREEN');
    });

    it('returns MULTICOLOR for invalid input', () => {
      expect(getMainColorFromHex(null)).toBe('MULTICOLOR');
      expect(getMainColorFromHex('invalid')).toBe('MULTICOLOR');
    });
  });

  describe('normalizeHex', () => {
    it('normalizes hex strings', () => {
      expect(normalizeHex('abc')).toBe('#ABC');
      expect(normalizeHex('#abc')).toBe('#ABC');
    });

    it('handles empty input', () => {
      expect(normalizeHex('')).toBe('');
      expect(normalizeHex(null)).toBe('');
    });
  });
});
