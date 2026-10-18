# Production deployment

The included Dockerfile serves the exported website and Express API together on PORT (8788 by default). This removes the requirement for a running laptop and avoids cross-origin API configuration for the web client. Deployment is prepared, not yet performed.

Build arguments (public client configuration only):
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- EXPO_PUBLIC_AUTH_REDIRECT_URL: stable HTTPS site URL followed by /account

Do not supply database passwords or service-role keys as build arguments. Local environment files are excluded from the Docker context. The runtime uses an unprivileged user and exposes /api/health for host monitoring. This endpoint reports process health, not provider freshness; separately inspect /api/availability-snapshot.

Choose an always-on container host with outbound HTTPS. Start with one replica because provider snapshots and refresh scheduling are process-local. Configure HTTPS, automatic restart and the health check. Do not enable a free sleep policy if instant first loads are required. Host/service costs require the user's selection.

After deployment, configure exact Supabase Site URL and /account redirect, configure a verified transactional email sender, and deploy pending migrations/functions. Set the native EXPO_PUBLIC_API_URL to the stable HTTPS host and rebuild/reload the native app. Do not use the website hostname for the native auth callback: installed builds use fairway://account. Expo Go requires its current development callback while testing.

Acceptance: open / and /account directly, sign in and out, test a second account, complete email confirmation/recovery, verify provider freshness and booking handoff, then test a cold restart. Keep the prior deployment available for rollback. No production container or deployment has been verified yet.
