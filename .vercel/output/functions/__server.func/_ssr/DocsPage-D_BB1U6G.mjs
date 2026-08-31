import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn } from "./router-BNAdKw7A.mjs";
import { n as FOCUS_RING, r as SpokenLabel } from "./AppHeader-CETfn4LJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DocsPage-D_BB1U6G.js
var import_jsx_runtime = require_jsx_runtime();
function Kbd({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: "inline-flex items-center rounded-sm border border-border bg-elevated px-1.5 py-0.5 font-mono text-xs font-medium text-foreground",
		children
	});
}
function KeyTable({ caption, columns, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-w-full min-w-0 overflow-x-auto",
		tabIndex: 0,
		role: "region",
		"aria-label": `${caption}. Scroll sideways for every column.`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "data-table mt-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
					className: "sr-only",
					children: caption
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-y border-border text-xs text-subtle",
					children: columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "px-3 py-2 text-left font-medium first:pl-0 last:pr-0",
						children: col
					}, col))
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border/80 align-top",
					children: row.map((cell, i) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(i === 0 ? "th" : "td", {
							scope: i === 0 ? "row" : void 0,
							className: cn("px-3 py-2 first:pl-0 last:pr-0", i === 0 ? "text-left font-medium text-foreground" : "font-mono text-xs text-muted-foreground"),
							children: cell
						}, `${row[0]}-${columns[i]}`);
					})
				}, row[0])) })
			]
		})
	});
}
function DocsPage({ eyebrow, title, headingId, lede, sections }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 sm:gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "felt relative overflow-hidden rounded-xl border border-border p-4 sm:p-6",
				"aria-labelledby": headingId,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: eyebrow })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: headingId,
						className: "mt-2 font-display text-3xl tracking-tight text-foreground sm:text-4xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: lede
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "On this page",
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "On this page" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 flex flex-col gap-1",
					children: sections.map((section, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `#${section.id}`,
						className: cn(FOCUS_RING, "flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-foreground hover:bg-elevated"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 shrink-0 font-mono text-xs tabular-nums text-subtle",
							children: index + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: section.title })]
					}) }, section.id))
				})]
			}),
			sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: section.id,
				"aria-labelledby": `${section.id}-heading`,
				className: "scroll-mt-4 rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					id: `${section.id}-heading`,
					className: "font-display text-2xl tracking-tight text-foreground",
					children: section.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground",
					children: section.children
				})]
			}, section.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Other pages",
				className: "flex flex-wrap gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated"),
						href: "/",
						children: "Table"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated"),
						href: "/guide",
						children: "Guide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated"),
						href: "/faq",
						children: "FAQ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated"),
						href: "/keys",
						children: "Keys"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated"),
						href: "/tests",
						children: "Tests"
					})
				]
			})
		]
	});
}
//#endregion
export { Kbd as n, KeyTable as r, DocsPage as t };
