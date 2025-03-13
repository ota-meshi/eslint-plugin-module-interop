import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/prefer-json-modules.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "prefer-json-modules",
  rule as any,
  await loadTestCases("prefer-json-modules"),
);
