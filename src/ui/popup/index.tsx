import {
  openCurrentPage,
  openWorkspace,
} from "../../platform/extension-browser";
import { render } from "preact";
import { styles } from "../styles";
import { cssVars } from "../../tokens";
import { Popup } from "./Popup";
const style = document.createElement("style");
style.textContent = styles;
document.head.append(style);
document.documentElement.style.cssText = cssVars("light");
render(
  <Popup
    onOpenPage={async () => {
      await openCurrentPage();
      window.close();
    }}
    onOpenWorkspace={() => {
      void openWorkspace();
      window.close();
    }}
  />,
  document.getElementById("app")!,
);
