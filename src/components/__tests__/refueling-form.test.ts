import { describe, it, expect } from 'vitest';
import { calculateTotal } from '../RefuelingForm';

describe('calculateTotal', () => {
  it('returns correct total for liters and price', () => {
    expect(calculateTotal(10, 5)).toBe('50.00');
  });
});
