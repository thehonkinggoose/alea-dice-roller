import { f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as Dices } from "../_libs/lucide-react.mjs";
import { i as cn } from "./router-BNAdKw7A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppHeader-CETfn4LJ.js
var import_jsx_runtime = require_jsx_runtime();
var FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
function describeDie(die) {
	const bits = [`${(die.sign ?? 1) < 0 ? "minus " : ""}d${die.sides} showing ${die.face}`];
	if (die.exploded) bits.push("exploded");
	if (!die.kept) bits.push("dropped, not counted");
	return bits.join(", ");
}
function describeDieTitle(die) {
	const sign = (die.sign ?? 1) < 0 ? "−" : "";
	return `${sign}d${die.sides}: ${sign}${die.face}${die.exploded ? " (explode)" : ""}${die.kept ? "" : " dropped"}`;
}
function slugLabel(label) {
	return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
/** Felt labels stay in small caps visually; the accessible name stays in normal case. */
function SpokenLabel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "uppercase tracking-widest",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only normal-case tracking-normal",
			children
		})]
	});
}
var linkBase = cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-2 text-xs font-medium uppercase tracking-widest transition-colors");
var NAV = [
	{
		to: "/",
		label: "Table",
		aria: "Table"
	},
	{
		to: "/guide",
		label: "Guide",
		aria: "Guide"
	},
	{
		to: "/faq",
		label: "FAQ",
		aria: "FAQ"
	},
	{
		to: "/keys",
		label: "Keys",
		aria: "Keyboard tutorial"
	},
	{
		to: "/tests",
		label: "Tests",
		aria: "Tests"
	}
];
var HINTS = {
	"/": {
		mobile: "Space to roll · history stays on this device",
		desktop: "Space to roll · Enter in the notation field · History stays on this device"
	},
	"/guide": { desktop: "How the table works" },
	"/faq": { desktop: "Short answers, same honesty as the table" },
	"/keys": { desktop: "JAWS Professional 2026 · Insert on desktop, Caps Lock on a laptop" },
	"/tests": { desktop: "Open a case for the full technical record" }
};
function AppHeader() {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const hint = HINTS[path] ?? HINTS["/guide"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-10 items-center justify-center rounded-lg border border-border bg-elevated text-foreground",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dices, {
					className: "size-5",
					strokeWidth: 1.75
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				id: "app-title",
				className: "font-display text-3xl leading-none tracking-tight text-foreground sm:text-4xl",
				children: "Alea"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm italic text-muted-foreground",
				children: "The die is cast."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-1 md:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-wrap items-center gap-1 md:justify-end",
					children: NAV.map((item) => {
						const current = path === item.to;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							"aria-label": item.aria,
							"aria-current": current ? "page" : void 0,
							className: linkBase,
							activeProps: { className: cn(linkBase, "text-foreground") },
							inactiveProps: { className: cn(linkBase, "text-subtle hover:text-foreground") },
							children: item.label
						}) }, item.to);
					})
				})
			}), hint.mobile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-48 text-right text-xs leading-relaxed text-subtle sm:hidden",
				children: hint.mobile
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hidden max-w-xs text-right text-xs leading-relaxed text-subtle sm:block",
				children: hint.desktop
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hidden max-w-xs text-right text-xs leading-relaxed text-subtle sm:block",
				children: hint.desktop
			})]
		})]
	});
}
//#endregion
export { describeDieTitle as a, describeDie as i, FOCUS_RING as n, slugLabel as o, SpokenLabel as r, AppHeader as t };
