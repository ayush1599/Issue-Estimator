#!/usr/bin/env python3
"""
Test script to verify Vercel-compatible changes work
"""

import requests
import json

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/health')
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_analyze_endpoint():
    """Test the analyze endpoint with a small repo"""
    try:
        data = {
            "repo_urls": ["https://github.com/octocat/Hello-World"],
            "hourly_rate": 80
        }
        
        response = requests.post(
            'http://localhost:5000/api/analyze',
            headers={'Content-Type': 'application/json'},
            json=data,
            timeout=30
        )
        
        print(f"Analyze endpoint: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Found {result.get('total_issues', 0)} issues")
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Analyze test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Vercel-compatible changes...")
    
    if test_health_endpoint():
        print("✓ Health endpoint working")
    else:
        print("✗ Health endpoint failed")
        
    if test_analyze_endpoint():
        print("✓ Analyze endpoint working")
    else:
        print("✗ Analyze endpoint failed")