# Encounter Screens - React Native Conversion Needed

## Issue

The following encounter screen files use web HTML components (`<div>`, `<button>`, `<span>`) instead of React Native components:

- `src/components/delvers-descent/encounters/encounter-screen.tsx`
- `src/components/delvers-descent/encounters/discovery-site-screen.tsx`
- `src/components/delvers-descent/encounters/puzzle-chamber-screen.tsx`
- `src/components/delvers-descent/encounters/trade-opportunity-screen.tsx`
- `src/components/delvers-descent/encounters/advanced/risk-event-screen.tsx`
- `src/components/delvers-descent/encounters/advanced/rest-site-screen.tsx`
- `src/components/delvers-descent/encounters/advanced/hazard-screen.tsx`

## Status

✅ **CONVERTED (3/7 files)**:

- `src/components/delvers-descent/encounters/advanced/risk-event-screen.tsx` ✅
- `src/components/delvers-descent/encounters/advanced/rest-site-screen.tsx` ✅
- `src/components/delvers-descent/encounters/advanced/hazard-screen.tsx` ✅

⏳ **REMAINING (4/7 files)** - Currently only used in tests:

- `src/components/delvers-descent/encounters/encounter-screen.tsx` (143 lines - exceeds max-lines-per-function)
- `src/components/delvers-descent/encounters/discovery-site-screen.tsx` (349 lines - exceeds max-lines-per-function)
- `src/components/delvers-descent/encounters/puzzle-chamber-screen.tsx` (254 lines - exceeds max-lines-per-function)
- `src/components/delvers-descent/encounters/trade-opportunity-screen.tsx` (285 lines - exceeds max-lines-per-function)

**Note**: These 4 remaining files have existing function-length issues and will need refactoring alongside React Native conversion. They are not yet integrated into the main app flow, so safe to proceed with Phase 5 work.

## Conversion Required

Before integrating these screens into the iOS app, they must be converted to use React Native components:

- Replace `div` with `View` from `react-native`
- Replace `button` with `Pressable` from `react-native`
- Replace `span` with `Text` from `react-native`
- Add proper React Native imports

## Phase 5 Status

All Phase 5 visual design components are correctly using React Native components.
