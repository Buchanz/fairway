# Fairway — Capstone project proposal

Status: prepared from the current agreed scope. Instructor submission and approval have not been verified. This document does not imply approval was obtained before development.

## Idea and audience
Fairway is a mobile-first golf application for recreational golfers who want to find a tee time and track their round. Golfers currently need to compare availability across separate course booking sites. Fairway groups available times by course and date, with filters for location, players and holes. The initial audience is golfers on Vancouver Island, with selected BC mainland coverage and future expansion as provider access permits.

## Core features
The application displays real tee-time availability for connected courses, supports distance and city searches, and redirects golfers to the official booking provider to complete reservations. It hides unsupported or expired inventory instead of inventing availability. A native on-course experience provides satellite maps, foreground GPS and manual target distances, alongside locally saved multiplayer stroke scorecards and round history.

Automatic front/centre/back distances use available mapped hole geometry, with accuracy verification still required. Integrated payment, booking-account linking, province-wide coverage are outside the initial release. Friend requests and shared completed rounds are implemented, with hosted account verification pending.

## Technology and design
Expo, React Native, React and TypeScript provide shared application code for iOS, Android and a tee-time browsing website. Expo Router manages navigation. Apple Maps is used on iOS and Google Maps on Android. Node.js and Express provide a backend with provider adapters, validation and cached availability snapshots. AsyncStorage persists rounds locally; Supabase Auth and PostgreSQL provide accounts, profiles, friendships and account-scoped round history. Instructor approval of PostgreSQL instead of the brief’s named MongoDB remains unverified.

The architecture separates presentation components, application state, pure domain functions, course metadata and provider integration code. Private API credentials remain server-side; client location access is opt-in and foreground-only.

## Testing and delivery
Unit and fixture-based integration tests cover provider parsing, booking windows, group capacity, pagination, cache expiry, search filters and score validation. Type checking, linting and platform bundle exports run locally and are configured for continuous integration. Physical-device testing will verify maps, permissions, persistence and on-course GPS behaviour.

Deliverables are a deployed application link, a public GitHub repository with installation/usage documentation, and a devlog containing progress, challenges, solutions, learnings and milestone evidence. Native beta distribution supplements the accessible web application. Store review timing is an external dependency.

## Risks and feasibility
The main risks are provider authorization and availability changes, reliable course geometry, GPS accuracy, and deployment/distribution setup. Fairway retains existing connected courses while new access is requested. Manual target measurement remains explicitly distinct from verified green distances. The remaining development focuses on device validation, a reliable deployed backend and completion of the capstone deliverables.
