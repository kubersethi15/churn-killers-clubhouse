#!/usr/bin/env python3
"""Validate a Churn Is Dead editorial issue before approval or publication."""

from __future__ import annotations

import argparse
import sys

from editorial_issue import load_issue, validate_issue


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("issue_dir")
    parser.add_argument("--require-approved", action="store_true")
    args = parser.parse_args()

    try:
        issue = load_issue(args.issue_dir)
    except ValueError as exc:
        print(f"ERROR: {exc}")
        return 1

    result = validate_issue(issue, require_approved=args.require_approved)
    for warning in result.warnings:
        print(f"WARNING: {warning}")
    for error in result.errors:
        print(f"ERROR: {error}")

    if not result.ok:
        print(f"Validation failed with {len(result.errors)} error(s).")
        return 1
    print(f"Validation passed: {issue.metadata['title']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
