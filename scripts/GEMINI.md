# GEMINI.md - Scripts Directory

## Directory Overview

This directory contains a collection of scripts for managing and automating tasks within the EDM Shuffle project. The scripts are written in a variety of languages, including Shell, JavaScript, and Python.

## Key Files

*   `generate-feed.js`: A Node.js script that fetches RSS feeds from various EDM news sources, processes the content, and generates a JSON file (`edm-news.json`). This is used to provide up-to-date content for the application.
*   `memlog.py`: A Python script that acts as a wrapper for shell commands. It logs the execution of commands, which is useful for tracking development activity and debugging.
*   `*.sh`: A collection of shell scripts for various development and operational tasks, including:
    *   `project-setup.sh`: Sets up the project for development.
    *   `check-code-quality.sh`: Runs code quality checks.
    *   `fix-code-quality.sh`: Attempts to automatically fix code quality issues.
    *   `dev-preflight.sh`: A script to be run before starting development.
    *   And many others for interacting with a system called "Beads", managing the repository, and verifying tasks.

## Usage

The scripts in this directory are intended to be run from the command line to automate various aspects of the project's lifecycle.

*   To generate the news feed, run: `node generate-feed.js`
*   To log a command, run: `python memlog.py <your_command_here>`
*   The shell scripts can be executed directly, for example: `./check-code-quality.sh`

It is recommended to inspect the contents of each script before running it to understand its function and potential impact.
