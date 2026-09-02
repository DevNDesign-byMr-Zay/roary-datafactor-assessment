# Conversational AI Service — Engineering Assessment Snapshot

Private, deidentified software-engineering assessment snapshot of a production-oriented conversational AI backend.

## Engineering scope

This repository demonstrates:

- Node.js and Express API service design
- Google Vertex AI / Gemini model integration
- Firestore-backed conversational memory
- Session-aware history reconstruction
- Robust response extraction across SDK response shapes
- Health and service endpoints
- Environment-driven deployment configuration
- Error handling and bounded conversation-history retrieval
- Dependency management and GitHub Actions CI

## Privacy and IP scope

This snapshot is intentionally deidentified. Product names, original cloud project identifiers, user/client references, and brand-specific application text have been replaced with neutral assessment-safe equivalents.

The repository contains only the backend and supporting engineering material selected for assessment. Unrelated proprietary visualization and interface subsystems are not included, and no source-repository Git history is inherited.

## Runtime configuration

The service expects Application Default Credentials for Google Cloud/Firebase and reads deployment configuration from environment variables. See `.env.example` for non-secret placeholders.

No credentials, API keys, tokens, production identifiers, or private user data are included.
