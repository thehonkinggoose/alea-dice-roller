import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as AppHeader } from "./AppHeader-CETfn4LJ.mjs";
import { P as isTypingTarget, X as useDiceStore, d as RollPanel, i as DiceTray, l as RandomnessLab, p as StatsStrip, u as ResultsTable } from "./RandomnessLab-Buyzdbxj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ZFYAXBoL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const hydrate = useDiceStore((s) => s.hydrate);
	const roll = useDiceStore((s) => s.roll);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (e.code !== "Space") return;
			if (e.repeat) return;
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			if (isTypingTarget(e.target)) return;
			if (useDiceStore.getState().rolling) return;
			e.preventDefault();
			roll();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [roll]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			id: "main-content",
			tabIndex: -1,
			"aria-labelledby": "app-title",
			className: "flex min-w-0 flex-col gap-5 outline-none sm:gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-5 lg:col-span-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiceTray, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsStrip, {})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-5 lg:col-span-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RollPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RandomnessLab, {})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsTable, {})]
		})]
	});
}
//#endregion
export { Home as component };
