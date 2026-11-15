/** One-line summaries shown under a category page's title. */
const summaries: Record<string, string> = {
    degree: "thesis research, coursework and lab duties",
    personal: "life admin, health, home and everything outside work",
    "start-up": "the company: product, customers and operations",
};

/** The summary line for a category, an empty string if it has none. */
export function categorySummary(category: string): string {
    return summaries[category] ?? "";
}
