/** The page the hash points at. */
export type Route =
    | { page: "inbox" }
    | { page: "next" }
    | { page: "settings" }
    | { page: "category"; name: string }
    | { page: "project"; number: number };

let hash = $state(location.hash);
window.addEventListener("hashchange", () => (hash = location.hash));

/** Turns a hash such as `#/project/12` into a route. Unknown or empty hashes give the inbox. */
export function parseRoute(hash: string): Route {
    const [page, arg] = hash.replace(/^#\/?/, "").split("/");
    if (page === "next" || page === "settings") return { page };
    if (page === "category" && arg)
        return { page, name: decodeURIComponent(arg) };
    if (page === "project" && Number(arg))
        return { page, number: Number(arg) };
    return { page: "inbox" };
}

/** The current route, updates when the hash changes. */
export const router = {
    get route(): Route {
        return parseRoute(hash);
    },
};

/** Hash link to a category page. */
export function categoryHref(name: string): string {
    return `#/category/${encodeURIComponent(name)}`;
}

/** Hash link to a project page. */
export function projectHref(number: number): string {
    return `#/project/${number}`;
}
