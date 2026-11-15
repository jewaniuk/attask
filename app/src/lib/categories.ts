/** One-line summaries shown under a category page's title. */
const summaries: Record<string, string> = {
    degree: "thesis research, coursework and lab duties",
    personal: "technical projects that are my own, outside work",
    "start-up": "building polar quantum technologies",
};

/** The summary line for a category, an empty string if it has none. */
export function categorySummary(category: string): string {
    return summaries[category] ?? "";
}
