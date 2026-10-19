import { AnalysisDrawer } from "./AnalysisDrawer";
import { parseDocument } from "../core/parse";
import { analyze } from "../core/analysis";
export default { title: "Prism/AnalysisDrawer", component: AnalysisDrawer };
export const Json = {
  args: {
    stats: analyze(parseDocument('{"ready":true,"list":[1,2,3]}', "json")),
  },
};
export const Xml = {
  args: {
    stats: analyze(
      parseDocument('<r xmlns:x="urn:x"><x:a id="1"/></r>', "xml"),
    ),
  },
};
