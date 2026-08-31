import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as AppHeader } from "./AppHeader-CETfn4LJ.mjs";
import { t as JawsTutorial } from "./JawsTutorial-B-o_Et3v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/keys-L410UuwZ.js
var import_jsx_runtime = require_jsx_runtime();
function KeysPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			id: "main-content",
			tabIndex: -1,
			"aria-labelledby": "keys-heading",
			className: "flex min-w-0 flex-col gap-5 outline-none sm:gap-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JawsTutorial, {})
		})]
	});
}
//#endregion
export { KeysPage as component };
