#!/usr/bin/env python3
"""
Seed script to populate the database with example automations and scenarios.
Run this after setting up the database to get started quickly.
"""

import requests
import json

API_BASE_URL = "http://localhost:8000/api/v1"

def create_automation(name, tinyfish_id, description, default_inputs):
    """Create an automation via API."""
    response = requests.post(
        f"{API_BASE_URL}/automations",
        json={
            "name": name,
            "tinyfish_automation_id": tinyfish_id,
            "description": description,
            "default_inputs": default_inputs
        }
    )
    response.raise_for_status()
    return response.json()

def create_scenario(name, automation_id, description, inputs_template):
    """Create a scenario via API."""
    response = requests.post(
        f"{API_BASE_URL}/scenarios",
        json={
            "name": name,
            "automation_id": automation_id,
            "description": description,
            "inputs_template": inputs_template,
            "run_settings": {
                "interval_seconds": 300,
                "concurrency": 1
            }
        }
    )
    response.raise_for_status()
    return response.json()

def main():
    print("🌱 Seeding database with example data...")
    print()
    
    print("Creating automations...")
    
    auto1 = create_automation(
        name="GPT-4 Chat Completion",
        tinyfish_id="auto_gpt4_chat",
        description="Standard GPT-4 chat completion automation",
        default_inputs={
            "model": "gpt-4",
            "temperature": 0.7,
            "max_tokens": 150
        }
    )
    print(f"  ✅ Created automation: {auto1['name']} (ID: {auto1['id']})")
    
    auto2 = create_automation(
        name="GPT-3.5 Turbo",
        tinyfish_id="auto_gpt35_turbo",
        description="Fast GPT-3.5 Turbo automation",
        default_inputs={
            "model": "gpt-3.5-turbo",
            "temperature": 0.5,
            "max_tokens": 100
        }
    )
    print(f"  ✅ Created automation: {auto2['name']} (ID: {auto2['id']})")
    
    print()
    print("Creating scenarios...")
    
    scenario1 = create_scenario(
        name="Simple Question Benchmark",
        automation_id=auto1['id'],
        description="Benchmark simple factual questions",
        inputs_template={
            "prompt": "What is the capital of France?",
            "max_tokens": 50
        }
    )
    print(f"  ✅ Created scenario: {scenario1['name']} (ID: {scenario1['id']})")
    
    scenario2 = create_scenario(
        name="Creative Writing Test",
        automation_id=auto1['id'],
        description="Test creative writing capabilities",
        inputs_template={
            "prompt": "Write a short poem about artificial intelligence",
            "max_tokens": 150,
            "temperature": 0.9
        }
    )
    print(f"  ✅ Created scenario: {scenario2['name']} (ID: {scenario2['id']})")
    
    scenario3 = create_scenario(
        name="Fast Response Benchmark",
        automation_id=auto2['id'],
        description="Benchmark fast model response times",
        inputs_template={
            "prompt": "Hello, how are you?",
            "max_tokens": 30
        }
    )
    print(f"  ✅ Created scenario: {scenario3['name']} (ID: {scenario3['id']})")
    
    print()
    print("🎉 Seeding complete!")
    print()
    print("You can now:")
    print("  1. View automations at http://localhost:3000/automations")
    print("  2. View scenarios at http://localhost:3000/scenarios")
    print("  3. Trigger benchmark runs from the scenarios page")
    print("  4. Monitor results at http://localhost:3000")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API at", API_BASE_URL)
        print("   Make sure the services are running: docker-compose up")
    except Exception as e:
        print(f"❌ Error: {e}")
