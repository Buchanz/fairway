-- Trigger-only helpers must not be exposed as callable API functions.
-- PostgreSQL invokes these through their existing triggers, not client RPCs.
revoke execute on function public.create_player_profile() from public, anon, authenticated;
revoke execute on function public.stamp_round_update() from public, anon, authenticated;
