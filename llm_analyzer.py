"""
LLM Analyzer Module
Handles AI-powered analysis of GitHub issues using OpenAI
"""

import os
import json
import hashlib
from typing import Dict, List
from openai import OpenAI


class LLMAnalyzer:
    """Analyzes GitHub issues using OpenAI to estimate complexity and cost"""

    # Hours ranges for each complexity level
    HOURS_RANGES = {
        'Low': (1, 6),      # 1-6 hours
        'Medium': (6, 15),  # 6-15 hours
        'High': (15, 25)    # 15-25 hours
    }

    # Default hourly rate
    DEFAULT_HOURLY_RATE = 80  # USD per hour

    def __init__(self):
        """Initialize the LLM client (OpenRouter or OpenAI)"""
        self.cache = {}  # In-memory cache for API responses

        # Check which provider to use
        provider = os.getenv('LLM_PROVIDER', 'openrouter').lower()
        print(f"DEBUG: LLM_PROVIDER env var: {os.getenv('LLM_PROVIDER', 'NOT SET')}")
        print(f"DEBUG: Using provider: {provider}")

        if provider == 'openrouter':
            api_key = os.getenv('OPENROUTER_API_KEY')
            if not api_key:
                raise ValueError("OPENROUTER_API_KEY not found in environment variables")

            # Configure OpenAI client to use OpenRouter with Vercel-optimized settings
            is_vercel = os.getenv('VERCEL') == '1'
            
            if is_vercel:
                # Vercel-specific configuration with custom timeout
                try:
                    import httpx
                except ImportError:
                    print("DEBUG: httpx not available, falling back to basic client")
                    httpx = None
                
                # Debug DNS resolution
                try:
                    import socket
                    openrouter_ip = socket.gethostbyname('openrouter.ai')
                    print(f"DEBUG: openrouter.ai resolves to: {openrouter_ip}")
                except Exception as dns_error:
                    print(f"DEBUG: DNS resolution failed: {dns_error}")
                
                # Try with explicit DNS and no proxy
                if httpx:
                    http_client = httpx.Client(
                        timeout=httpx.Timeout(timeout=30.0, connect=10.0, read=30.0),
                        limits=httpx.Limits(max_connections=10, max_keepalive_connections=2),
                        verify=True,  # Ensure SSL verification
                        proxies=None,  # Explicitly disable proxies
                        follow_redirects=True
                    )
                else:
                    http_client = None
                
                base_url = "https://openrouter.ai/api/v1"
                print(f"DEBUG: Setting base_url to: {base_url}")
                
                if http_client:
                    self.client = OpenAI(
                        api_key=api_key,
                        base_url=base_url,
                        http_client=http_client,
                        max_retries=0  # Disable automatic retries, we handle them manually
                    )
                else:
                    self.client = OpenAI(
                        api_key=api_key,
                        base_url=base_url,
                        max_retries=0  # Disable automatic retries, we handle them manually
                    )
                
                # Verify the client was configured correctly
                print(f"DEBUG: Client base_url after init: {self.client.base_url}")
                print(f"DEBUG: Client API key present: {bool(self.client.api_key)}")
                print(f"DEBUG: Client API key starts with: {self.client.api_key[:10] if self.client.api_key else 'None'}...")
                
                # Test basic connectivity to OpenRouter
                try:
                    import requests
                    test_response = requests.get("https://openrouter.ai/api/v1/models", timeout=10)
                    print(f"DEBUG: OpenRouter connectivity test - Status: {test_response.status_code}")
                except ImportError:
                    print("DEBUG: requests library not available for connectivity test")
                except Exception as conn_error:
                    print(f"DEBUG: OpenRouter connectivity test failed: {conn_error}")
            else:
                # Standard configuration for local development
                self.client = OpenAI(
                    api_key=api_key,
                    base_url="https://openrouter.ai/api/v1",
                    max_retries=0  # Disable automatic retries, we handle them manually
                )
            
            # Using GPT-5-nano via OpenRouter
            self.model = "openai/gpt-5-nano"
        else:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")

            self.client = OpenAI(api_key=api_key)
            # Using GPT-4o-mini for reliable and cost-efficient analysis
            self.model = "gpt-4o-mini"

    def _build_analysis_prompt(self, title: str, body: str, labels: List[str]) -> str:
        """
        Build the prompt for LLM analysis

        Args:
            title: Issue title
            body: Issue description
            labels: List of issue labels

        Returns:
            Formatted prompt string
        """
        labels_str = ', '.join(labels) if labels else 'None'

        prompt = f"""Analyze the following GitHub issue and estimate the development effort required to resolve it.

**Issue Title:** {title}

**Description:** {body[:1000] if body else 'No description provided'}

**Labels:** {labels_str}

**Analysis Instructions:**
1. Read and understand the issue thoroughly
2. Identify what needs to be fixed, implemented, or changed
3. Consider the scope of changes required (code, tests, documentation)
4. Estimate the complexity based on:
   - Technical difficulty
   - Amount of code changes needed
   - Testing requirements
   - Potential edge cases
   - Dependencies and integrations

**Complexity Levels:**
- **Low** (1-6 hours): Simple bug fixes, typos, documentation updates, minor UI tweaks, straightforward features
- **Medium** (6-15 hours): Moderate features, refactoring, API changes, complex bug fixes, new components
- **High** (15-25 hours): Major features, architecture changes, large-scale refactoring, complex integrations

**Output Format:**
Return ONLY valid JSON with NO markdown, NO code blocks, NO explanations outside the JSON:

{{"complexity": "Low|Medium|High", "estimated_hours": <number between 1-25>, "reasoning": "<ul><li>Brief analysis point 1</li><li>Brief analysis point 2</li></ul>"}}

**Example Output:**
{{"complexity": "Medium", "estimated_hours": 8, "reasoning": "<ul><li>Requires updating authentication flow across 3 components</li><li>Need to add integration tests and update documentation</li></ul>"}}

**Your JSON response:**"""

        return prompt

    def _parse_llm_response(self, response_text: str) -> Dict:
        """
        Parse and validate LLM response
        For GPT-5 models, extract JSON from reasoning text

        Args:
            response_text: Raw text response from LLM (may contain reasoning + JSON)

        Returns:
            Dictionary with complexity and estimated_cost
        """
        print(f"DEBUG: Received response from LLM (length: {len(response_text) if response_text else 0})")
        print(f"DEBUG: First 200 chars: {response_text[:200] if response_text else 'EMPTY'}")

        if not response_text or not response_text.strip():
            print("ERROR: Received empty response from LLM")
            raise ValueError("Empty response from LLM")

        try:
            # For GPT-5 models, the response contains reasoning text with JSON embedded
            # We need to extract the JSON object from the text

            # First, try to find JSON in markdown code blocks
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()

            # Look for JSON object - find the first { and its matching }
            if '{' in response_text:
                json_start = response_text.find('{')
                # Find the matching closing brace
                brace_count = 0
                json_end = -1
                for i in range(json_start, len(response_text)):
                    if response_text[i] == '{':
                        brace_count += 1
                    elif response_text[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            json_end = i + 1
                            break

                if json_end > json_start:
                    response_text = response_text[json_start:json_end]

            print(f"DEBUG: Attempting to parse JSON: {response_text[:200]}")
            data = json.loads(response_text)

            # Validate complexity
            complexity = data.get('complexity', 'Medium')
            if complexity not in ['Low', 'Medium', 'High']:
                complexity = 'Medium'

            # Validate hours
            estimated_hours = float(data.get('estimated_hours', 8))

            # Ensure hours is within valid range
            min_hours, max_hours = self.HOURS_RANGES[complexity]
            if estimated_hours < min_hours:
                estimated_hours = min_hours
            elif estimated_hours > max_hours:
                estimated_hours = max_hours

            # Get reasoning
            reasoning = data.get('reasoning', 'No detailed reasoning provided.')

            return {
                'complexity': complexity,
                'estimated_hours': round(estimated_hours, 1),
                'reasoning': reasoning
            }

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error parsing LLM response: {e}")
            print(f"Raw response (full): {response_text}")
            print(f"Response type: {type(response_text)}")
            print(f"Response length: {len(response_text) if response_text else 'None'}")
            
            # Try to extract any JSON-like content for debugging
            if response_text and '{' in response_text:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start >= 0 and end > start:
                    json_part = response_text[start:end]
                    print(f"Extracted JSON part: {json_part}")
            
            # Return default values if parsing fails
            return {
                'complexity': 'Medium',
                'estimated_hours': 8.0,
                'reasoning': f'Default estimate due to parsing error: {str(e)}. Raw response: {response_text[:100]}...'
            }

    def analyze_issue(self, title: str, body: str, labels: List[str]) -> Dict:
        """
        Analyze a GitHub issue using LLM with caching

        Args:
            title: Issue title
            body: Issue description
            labels: List of issue labels

        Returns:
            Dictionary with complexity and estimated_cost
        """
        # Create cache key from issue content
        cache_key = hashlib.md5(f"{title}{body[:1000]}{''.join(sorted(labels))}".encode()).hexdigest()

        # Check cache first
        if cache_key in self.cache:
            print(f"Using cached result for issue: {title[:50]}")
            return self.cache[cache_key]

        prompt = self._build_analysis_prompt(title, body, labels)

        try:
            response = self._analyze_with_openai(prompt)
            result = self._parse_llm_response(response)

            # Calculate estimated cost based on hours and default hourly rate
            result['estimated_cost'] = round(result['estimated_hours'] * self.DEFAULT_HOURLY_RATE, 2)

            # Cache the result
            self.cache[cache_key] = result
            return result

        except Exception as e:
            print(f"Error during LLM analysis: {e}")
            # Return default values on error
            return {
                'complexity': 'Medium',
                'estimated_hours': 8.0,
                'estimated_cost': round(8.0 * self.DEFAULT_HOURLY_RATE, 2),
                'reasoning': f'Default estimate due to error: {str(e)}. Manual review recommended.'
            }

    def _analyze_with_openai(self, prompt: str) -> str:
        """
        Get analysis from OpenAI with retry logic optimized for Vercel

        Args:
            prompt: Analysis prompt

        Returns:
            Response text
        """
        # Detect if running on Vercel (shorter timeout, no retries)
        is_vercel = os.getenv('VERCEL') == '1'
        max_retries = 1 if is_vercel else 3
        timeout = 25.0 if is_vercel else 30.0  # Increased Vercel timeout
        last_error = None

        print(f"DEBUG: Starting API call - Vercel: {is_vercel}, Timeout: {timeout}")
        print(f"DEBUG: Base URL: {self.client.base_url}")
        print(f"DEBUG: Model: {self.model}")
        print(f"DEBUG: Provider should be OpenRouter (base_url contains 'openrouter'): {'openrouter' in str(self.client.base_url).lower()}")

        for attempt in range(max_retries):
            try:
                print(f"DEBUG: Making API call attempt {attempt + 1}/{max_retries}")

                # Build API parameters (some models don't support temperature)
                # GPT-5 models use reasoning tokens internally + output in content field
                # Need high token limit to allow reasoning to complete before output
                max_tokens = 4000 if "gpt-5" in self.model else 300

                api_params = {
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a JSON-only API. Return ONLY valid JSON. No explanations, no markdown, no other text."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": max_tokens,
                    "timeout": timeout
                }

                # Only add temperature for non-gpt-5-nano models
                if "gpt-5-nano" not in self.model:
                    api_params["temperature"] = 0.2

                print(f"DEBUG: API params prepared, making request...")
                
                # For Vercel, try direct requests approach to avoid client issues
                if is_vercel:
                    try:
                        print(f"DEBUG: Using direct requests approach for Vercel")
                        import requests
                        import json
                        
                        headers = {
                            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://github.com/ayush1599/Issue-Estimator",
                            "X-Title": "Issue Estimator"
                        }
                        
                        payload = {
                            "model": self.model,
                            "messages": api_params["messages"],
                            "max_tokens": api_params["max_tokens"]
                        }
                        
                        if "temperature" in api_params:
                            payload["temperature"] = api_params["temperature"]
                        
                        print(f"DEBUG: Making direct POST to https://openrouter.ai/api/v1/chat/completions")
                        
                        response_raw = requests.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers=headers,
                            json=payload,
                            timeout=timeout
                        )
                        
                        print(f"DEBUG: Direct request status: {response_raw.status_code}")
                        
                        if response_raw.status_code != 200:
                            print(f"DEBUG: Direct request failed: {response_raw.text}")
                            raise Exception(f"OpenRouter API error: {response_raw.status_code} - {response_raw.text}")
                        
                        response_data = response_raw.json()
                        
                        # Create a mock response object that matches OpenAI client format
                        class MockMessage:
                            def __init__(self, content):
                                self.content = content
                                self.reasoning = None
                        
                        class MockChoice:
                            def __init__(self, message):
                                self.message = message
                        
                        class MockResponse:
                            def __init__(self, choices):
                                self.choices = choices
                        
                        content = response_data["choices"][0]["message"]["content"]
                        response = MockResponse([MockChoice(MockMessage(content))])
                        
                    except ImportError:
                        print(f"DEBUG: requests not available, falling back to OpenAI client")
                        response = self.client.chat.completions.create(**api_params)
                    except Exception as direct_error:
                        print(f"DEBUG: Direct requests failed: {direct_error}, falling back to OpenAI client")
                        response = self.client.chat.completions.create(**api_params)
                else:
                    response = self.client.chat.completions.create(**api_params)
                
                print(f"DEBUG: Response object received successfully.")

                # Get the response content
                message = response.choices[0].message
                content = message.content

                print(f"DEBUG: Content field: {repr(content)[:200] if content else 'EMPTY'}")
                print(f"DEBUG: Content length: {len(content) if content else 0}")

                # GPT-5 models may also have reasoning field, log it for debugging
                if hasattr(message, 'reasoning') and message.reasoning:
                    print(f"DEBUG: Reasoning field exists, length: {len(message.reasoning)}")
                    print(f"DEBUG: Reasoning preview: {message.reasoning[:200]}")

                return content if content else ""
                
            except Exception as e:
                last_error = e
                error_msg = str(e)
                print(f"OpenAI API attempt {attempt + 1}/{max_retries} failed: {error_msg}")
                
                # Log additional details for debugging
                print(f"DEBUG - Error type: {type(e).__name__}")
                print(f"DEBUG - Full error: {repr(e)}")
                
                # Check for specific connection errors
                if "connection" in error_msg.lower() or "timeout" in error_msg.lower():
                    print(f"DEBUG - Connection/timeout error detected")
                    if is_vercel:
                        print(f"DEBUG - This is a Vercel deployment, connection issues are common")
                
                # Check for SSL/TLS errors
                if "ssl" in error_msg.lower() or "certificate" in error_msg.lower():
                    print(f"DEBUG - SSL/Certificate error detected")
                
                # Only retry if not on Vercel and not last attempt
                if not is_vercel and attempt < max_retries - 1:
                    import time
                    time.sleep(0.5)  # Shorter retry delay

        # If all retries failed, raise the last error
        print(f"DEBUG - All attempts failed, raising last error: {last_error}")
        raise last_error


def test_analyzer():
    """Test function to verify LLM analyzer works"""
    analyzer = LLMAnalyzer()

    test_issue = {
        'title': 'Add dark mode support',
        'body': 'Users have requested a dark mode theme for the application. This would involve updating CSS and adding a toggle switch.',
        'labels': ['enhancement', 'ui']
    }

    print("Testing LLM Analyzer...")
    result = analyzer.analyze_issue(
        test_issue['title'],
        test_issue['body'],
        test_issue['labels']
    )

    print(f"\nResults:")
    print(f"Complexity: {result['complexity']}")
    print(f"Estimated Cost: ${result['estimated_cost']}")
    print(f"Reasoning: {result['reasoning']}")


if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    test_analyzer()
