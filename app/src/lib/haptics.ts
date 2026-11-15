// hidden iOS switch, built on first use; Safari gives a light tick when a switch is toggled
let tickSwitch: HTMLLabelElement | null = null;

/**
 * Gives a short tap feel on the phone. Android uses the vibration API. iPhone has no such API, so this toggles a hidden `<input switch>`, which Safari answers with a tick; it only works while handling a tap or the end of a touch, not in the middle of a drag. Does nothing where neither is available.
 */
export function tick(): void {
    if ("vibrate" in navigator) {
        navigator.vibrate(10);
        return;
    }
    if (!tickSwitch) {
        tickSwitch = document.createElement("label");
        tickSwitch.setAttribute("aria-hidden", "true");
        tickSwitch.style.cssText = "position:fixed;left:-100px;top:0;opacity:0;pointer-events:none";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.setAttribute("switch", "");
        tickSwitch.append(input);
        document.body.append(tickSwitch);
    }
    tickSwitch.click();
}
