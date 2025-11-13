#!/usr/bin/env python
"""
Quick script to run all tests and display summary
"""
import subprocess
import sys

def run_tests(test_files, label):
    """Run pytest on specified files and return results"""
    print(f"\n{'='*60}")
    print(f"{label}")
    print(f"{'='*60}")
    
    cmd = [sys.executable, "-m", "pytest"] + test_files + ["--tb=no", "-v"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    output = result.stdout + result.stderr
    print(output)
    
    # Parse results
    for line in output.split('\n'):
        if 'passed' in line.lower() or 'failed' in line.lower():
            print(f"\n{label} SUMMARY: {line}")
            return line
    
    return "No summary found"

# Run unit tests
unit_tests = [
    "app/tests/test_models_unit.py",
    "app/tests/test_quiz_service_unit.py",
    "app/tests/test_result_service_unit.py"
]

# Run integration tests
integration_tests = [
    "app/tests/test_auth.py",
    "app/tests/test_quizzes.py",
    "app/tests/test_answers.py",
    "app/tests/test_results.py",
    "app/tests/test_jokes.py"
]

print("\n" + "="*60)
print("QUIZRUPTION TEST SUITE - COMPREHENSIVE RUN")
print("="*60)

unit_summary = run_tests(unit_tests, "UNIT TESTS")
integration_summary = run_tests(integration_tests, "INTEGRATION TESTS")

print("\n" + "="*60)
print("FINAL SUMMARY")
print("="*60)
print(f"Unit Tests: {unit_summary}")
print(f"Integration Tests: {integration_summary}")
