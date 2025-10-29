#!/usr/bin/env python3
"""
Test script to verify environment variables are loaded correctly on Vercel
"""

import os
from dotenv import load_dotenv

# Load environment variables (works locally, not on Vercel)
load_dotenv()

def test_env_vars():
    """Test if required environment variables are available"""
    
    print("=== Environment Variable Test ===")
    
    # Check if running on Vercel
    is_vercel = os.getenv('VERCEL') == '1'
    print(f"Running on Vercel: {is_vercel}")
    
    # Check LLM provider
    llm_provider = os.getenv('LLM_PROVIDER', 'not set')
    print(f"LLM_PROVIDER: {llm_provider}")
    
    # Check OpenRouter API key
    openrouter_key = os.getenv('OPENROUTER_API_KEY')
    if openrouter_key:
        print(f"OPENROUTER_API_KEY: {openrouter_key[:8]}...{openrouter_key[-4:]} (length: {len(openrouter_key)})")
    else:
        print("OPENROUTER_API_KEY: NOT SET")
    
    # Check GitHub token
    github_token = os.getenv('GITHUB_TOKEN')
    if github_token:
        print(f"GITHUB_TOKEN: {github_token[:8]}...{github_token[-4:]} (length: {len(github_token)})")
    else:
        print("GITHUB_TOKEN: NOT SET")
    
    # Test OpenRouter connection
    if openrouter_key and llm_provider == 'openrouter':
        try:
            from openai import OpenAI
            client = OpenAI(
                api_key=openrouter_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            # Simple test call
            response = client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=[{"role": "user", "content": "Say 'test successful'"}],
                max_tokens=10
            )
            
            print(f"OpenRouter test: SUCCESS - {response.choices[0].message.content}")
            
        except Exception as e:
            print(f"OpenRouter test: FAILED - {str(e)}")
    else:
        print("OpenRouter test: SKIPPED (missing key or wrong provider)")

if __name__ == '__main__':
    test_env_vars()