# Testing on a phone

Two layers, no Xcode. Nothing here touches the board: use a throwaway project for any write test.

## 1. Emulated phone (Playwright)

For layout, CSS, JS and touch bugs. Real WebKit (macOS build) for iPhone, Chromium for Android. It has **no** safe areas, status bar, home-screen mode or haptics.

```
cd tools && npm install && npx playwright install webkit chromium   # once, ~900 MB in ~/Library/Caches/ms-playwright
node emulate.mjs http://localhost:5173 /tmp/shot.png iphone         # or android
```

The app needs the Worker URL and app key from Settings, so signed-out pages are what this shows unless you script a login (never commit the key).

## 2. Your real iPhone over USB

For anything iOS-specific (status bar strip, safe areas, `100dvh`, home-screen mode). Reads the page running on the phone.

One-time:

- `brew install libimobiledevice ios-webkit-debug-proxy`
- phone: plug in, tap Trust, turn on Settings > Apps > Safari > Advanced > Web Inspector
- open the app (Safari tab or home-screen icon) so there is a page to inspect

Each session:

```
ios_webkit_debug_proxy &                       # lists pages at http://localhost:9222/json
cd tools
node phone.mjs '<js expression>' [page index]  # runs js on the phone, prints the result
node phone.mjs --shot out.png                  # page screenshot (not the status bar)
```

`phone.mjs` needs the page unlocked and in the foreground. If a page is listed but never answers, restart the proxy. Measuring (`getBoundingClientRect`, `getComputedStyle`, `env(safe-area-inset-*)` through a probe element) beats guessing; for what the eye sees (status bar, haptics) ask the user.

## Lessons from the first use

- **A home-screen icon keeps the settings it had when it was added.** The status bar strip bug of checkpoint C was an old icon made before `viewport-fit=cover` and `black-translucent` were in the page. Delete and re-add the icon after changing those. The new icon starts signed out: its storage is separate.
- **iOS 26 home-screen apps:** at times `innerHeight` and `100dvh` are 59px short of the screen (`100lvh` stays right), so fixed `bottom` offsets float 59px high. It later went away on its own, so never measure it once at load: use `calc(... - var(--standalone) * (100lvh - 100dvh))`, which `main.ts` and `BottomBar.svelte` do. Cause unknown. It always starts short on a cold start and the first swipe fixes it (the page must be scrollable and scroll), so `wakeViewport()` in `main.ts` does that by hand: a page 1px too tall, scrolled down and back. Check `innerHeight` against `screen.height` before trusting a layout measurement.
- **`backdrop-filter` was clipped** to that short area (873px of 932px) while it lasted; plain fixed layers were not. The pill has no blur because of it.

## Not covered

Haptics, Android, and iPhone Mirroring (the Mac can't be scripted to drive it, and `idevicescreenshot` needs a developer disk image). An Android phone over `adb` and Chrome DevTools is the plan for the next project.
