import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('participants.getMyData', () => {
  it('should return participant data for user 240176', async () => {
    // Create a mock context with user
    const mockContext = {
      user: {
        id: 240176,
        email: 's.sachs+kompass@sachs-media.com',
        name: 'Stefan Sachs',
        role: 'user' as const,
        tenantId: null,
      },
    };

    // Create caller with mock context
    const caller = appRouter.createCaller(mockContext as any);

    // Call getMyData
    const result = await caller.participants.getMyData();

    console.log('getMyData result:', JSON.stringify(result, null, 2));

    // Assertions
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result.email).toBe('s.sachs+kompass@sachs-media.com');
    expect(result.courseId).toBe(1);
    expect(result.courseName).toBe('Digitales Marketing & Social Media Management');
  });
});
