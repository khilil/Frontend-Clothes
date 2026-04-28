import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
    it('formats number correctly', () => {
        expect(formatCurrency(1000)).toBe('₹' + '1,000');
    });

    it('handles decimal values', () => {
        expect(formatCurrency(1000.5)).toBe('₹' + '1,000.5');
    });

    it('handles strings that are numbers', () => {
        expect(formatCurrency('2000')).toBe('₹' + '2,000');
    });
});
