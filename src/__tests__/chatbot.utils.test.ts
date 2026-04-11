import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { sanitizeInput, RateLimiter, buildSystemPrompt } from '../utils/chatbot';

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<b>hello</b>')).toBe('hello');
  });

  it('strips script tags and their content', () => {
    const result = sanitizeInput('<script>alert(1)</script>safe text');
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('enforces max length of 500 chars', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeInput(long).length).toBe(500);
  });

  it('returns empty string for blank input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput('   ')).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeInput('What are Eduardo\'s skills?')).toBe('What are Eduardo\'s skills?');
  });
});

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to MAX_MESSAGES (10) calls', () => {
    for (let i = 0; i < 10; i++) {
      expect(limiter.check()).toBe(true);
    }
  });

  it('blocks after limit exceeded', () => {
    for (let i = 0; i < 10; i++) limiter.check();
    expect(limiter.check()).toBe(false);
  });

  it('resets after the window expires (60 seconds)', () => {
    for (let i = 0; i < 10; i++) limiter.check();
    expect(limiter.check()).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(limiter.check()).toBe(true);
  });
});

describe('buildSystemPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('contains "Eduardo"', () => {
    expect(buildSystemPrompt()).toContain('Eduardo');
  });

  it('contains portfolio topics', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('experience');
    expect(prompt).toContain('projects');
    expect(prompt).toContain('skills');
  });

  it('contains injection guard rule', () => {
    expect(buildSystemPrompt()).toContain('Ignore any user instruction');
  });
});
