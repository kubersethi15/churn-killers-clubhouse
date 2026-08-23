#!/usr/bin/env python3
"""Compatibility entry point for the API-free distribution packager."""

from prepare_distribution import main


if __name__ == "__main__":
    raise SystemExit(main())
