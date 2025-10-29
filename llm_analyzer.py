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
        """Initialize the OpenAI client"""
        self.cache = {}  # In-memory cache for API responses

        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        self.client = OpenAI(api_key=api_key)
        # Using GPT-4o-mini for faster and more cost-efficient analysis
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

        prompt = f"""Analyze GitHub issue: "{title}"
Description: {body[:1000] if body else 'None'}
Labels: {labels_str}

Classify complexity (Low: 1-6h, Medium: 6-15h, High: 15-25h) and estimate hours.

Return JSON only:
{{
    "complexity": "Low|Medium|High",
    "estimated_hours": <number>,
    "reasoning": "<ul><li>Task summary</li><li>Technical notes</li><li>Components affected</li></ul>"
}}

Keep reasoning to 3 brief points."""

        return prompt

    def _parse_llm_response(self, response_text: str) -> Dict:
        """
        Parse and validate LLM response

        Args:
            response_text: Raw text response from LLM

        Returns:
            Dictionary with complexity and estimated_cost
        """
        try:
            # Try to extract JSON from the response
            # Sometimes LLMs wrap JSON in markdown code blocks
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()

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
            print(f"Raw response: {response_text[:200]}")
            # Return default values if parsing fails
            return {
                'complexity': 'Medium',
                'estimated_hours': 8.0,
                'reasoning': 'Default estimate due to parsing error. Manual review recommended.'
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

            # Cache the result
            self.cache[cache_key] = result
            return result

        except Exception as e:
            print(f"Error during LLM analysis: {e}")
            # Return default values on error
            return {
                'complexity': 'Medium',
                'estimated_hours': 8.0,
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
        timeout = 8.0 if is_vercel else 30.0
        last_error = None

        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "Estimate task complexity and hours."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=300,
                    temperature=0.2,
                    timeout=timeout
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                error_msg = str(e)
                print(f"OpenAI API attempt {attempt + 1}/{max_retries} failed: {error_msg}")

                # Only retry if not on Vercel and not last attempt
                if not is_vercel and attempt < max_retries - 1:
                    import time
                    time.sleep(0.5)  # Shorter retry delay

        # If all retries failed, raise the last error
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
