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
- **iOS 26 home-screen apps:** `innerHeight` and `100dvh` are 59px short of the screen, so fixed `bottom` offsets float 59px high; `main.ts` sets `--viewport-gap` for this.
- **`backdrop-filter` is clipped** to that same top 873px of the 932px screen in a home-screen app. Plain fixed layers are not.

## Not covered

Haptics, Android, and iPhone Mirroring (the Mac can't be scripted to drive it, and `idevicescreenshot` needs a developer disk image). An Android phone over `adb` and Chrome DevTools is the plan for the next project.
