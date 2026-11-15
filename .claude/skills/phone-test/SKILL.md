---
name: phone-test
description: Test attask on a phone, emulated (Playwright) or on the user's real iPhone over USB (inspect, measure, screenshot). Use for iPhone-only layout, safe-area or home-screen bugs.
---

Read `docs/mobile-testing.md` first, it has the setup and commands.

1. Emulated check: `cd tools && node emulate.mjs <url> <png> [iphone|android]`, then read the png.
2. Real phone: check `curl -s localhost:9222/json` lists a page; if not, start `ios_webkit_debug_proxy &`, and tell the user to plug in and unlock the phone and open the app. Then `cd tools && node phone.mjs '<js>'` to measure, `--shot` for a page screenshot.
3. Measure before changing code. Things the eye must judge (status bar strip, haptics) go to the user as one precise look-and-report question; set test styles live through `phone.mjs` so nothing is committed until they say it looks right.
4. Never type the app key or token into a command. The user enters them in Settings.
