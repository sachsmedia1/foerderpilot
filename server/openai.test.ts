/**
 * OPENAI API KEY VALIDATION TEST
 * 
 * Validates that the OpenAI API key is correctly set and functional
 */

import { describe, it, expect } from 'vitest';
import { invokeLLM } from './_core/llm';

describe('OpenAI API Key Validation', () => {
  it('should successfully call OpenAI API with valid key', async () => {
    // Simple test call to verify API key works
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OK" if you can read this.' },
      ],
    });

    // Verify response structure
    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0].message).toBeDefined();
    expect(response.choices[0].message.content).toBeDefined();
    
    // Verify content is not empty
    const content = response.choices[0].message.content;
    expect(typeof content === 'string' ? content.length : 0).toBeGreaterThan(0);
    
    console.log('✅ OpenAI API Key is valid and working!');
  }, 30000); // 30s timeout for API call
});
