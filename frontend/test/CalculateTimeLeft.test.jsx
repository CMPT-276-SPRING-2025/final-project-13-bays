import { calculateTimeLeft } from '../src/components/CalculateTimeLeft';

describe('calculateTimeLeft', () => {
  test('should return "Today" for today\'s date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculateTimeLeft(today)).toBe('Today');
  });

  test('should return "Past due" for a past date', () => {
    expect(calculateTimeLeft('2025-01-01')).toContain('Past due');
  });

  test('should return "Tomorrow" for tomorrow\'s date', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(calculateTimeLeft(tomorrow)).toBe('Tomorrow');
  });
});