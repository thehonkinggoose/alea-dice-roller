import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as AppHeader } from "./AppHeader-CETfn4LJ.mjs";
import { t as UserGuide } from "./UserGuide-CSOSLwRQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-CjyczmWN.js
var import_jsx_runtime = require_jsx_runtime();
function GuidePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			id: "main-content",
			tabIndex: -1,
			"aria-labelledby": "guide-heading",
			className: "flex min-w-0 flex-col gap-5 outline-none sm:gap-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserGuide, {})
		})]
	});
}
//#endregion
export { GuidePage as component };
