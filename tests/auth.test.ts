import { describe, it, expect } from 'vitest';
import { mockAuthFunctions } from '../src/lib/supabase';

describe('authentication', () => {
  it('logs in and returns user data', async () => {
    const { user, error } = await mockAuthFunctions.signIn('test@example.com', 'password');
    expect(error).toBeNull();
    expect(user?.email).toBe('test@example.com');
  });

  it('logs out without error', async () => {
    const result = await mockAuthFunctions.signOut();
    expect(result.error).toBeNull();
  });
});
