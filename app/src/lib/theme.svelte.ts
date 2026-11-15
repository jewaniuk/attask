/** Colour theme choice: follow the system, or force light or dark. */
export type Theme = "system" | "light" | "dark";

/** Theme choices in the order Settings shows them. */
export const themes: Theme[] = ["system", "light", "dark"];

function loadTheme(): Theme {
    const saved = localStorage.getItem("attask.theme");
    return saved === "light" || saved === "dark" ? saved : "system";
}

/** The current choice, shared with Settings. Change it with `setTheme`. */
export const theme: { choice: Theme } = $state({ choice: loadTheme() });

// theme.css reads data-theme on <html>; no attribute means follow the system
function apply(): void {
    if (theme.choice === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme.choice;
}

/** Saves the choice to localStorage and applies it to the page. */
export function setTheme(choice: Theme): void {
    theme.choice = choice;
    localStorage.setItem("attask.theme", choice);
    apply();
}

// apply the saved choice as soon as this module loads, before the app mounts
apply();
