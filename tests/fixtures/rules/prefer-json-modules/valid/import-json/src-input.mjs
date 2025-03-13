import a from "./target.json" with { type: "json" };
import b from "./target" with { type: "json" };
const c = await import("./target.json", { with: { type: "json" } });
const d = await import("./target", { with: { type: "json" } });
