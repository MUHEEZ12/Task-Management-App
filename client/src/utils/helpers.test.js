import { formatDate, getPriorityColor, getInitials } from './helpers';

describe('helpers utilities', () => {
  it('formats dates as readable strings', () => {
    const isoDate = '2026-08-15T14:30:00.000Z';
    const result = formatDate(isoDate);

    expect(result).toBe('Aug 15, 2026');
  });

  it('returns the correct priority color string', () => {
    expect(getPriorityColor('low')).toContain('blue');
    expect(getPriorityColor('high')).toContain('orange');
    expect(getPriorityColor('critical')).toContain('red');
  });

  it('builds initials from a name', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
    expect(getInitials('Single')).toBe('S');
  });
});
