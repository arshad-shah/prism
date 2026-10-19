import {
  openCurrentPage,
  openWorkspace,
} from "../../platform/extension-browser";
import { render } from "preact";
import { Button } from "../Button";
import { PRODUCT } from "../../brand/product";
import { styles } from "../styles";
import { cssVars } from "../../tokens";
import { useState } from "preact/hooks";
const style = document.createElement("style");
style.textContent = styles;
document.head.append(style);
document.documentElement.style.cssText = cssVars("light");
function Popup() {
  const [error, setError] = useState("");
  return (
    <section class="empty">
      <h1>{PRODUCT.name}</h1>
      <p>Read JSON and XML in one clear workspace.</p>
      <div class="actions">
        <Button
          primary
          onClick={async () => {
            try {
              await openCurrentPage();
              window.close();
            } catch {
              setError(
                "This browser page cannot host Prism. Open a document in the workspace.",
              );
            }
          }}
        >
          Open on this page
        </Button>
        <Button
          onClick={() => {
            void openWorkspace();
            window.close();
          }}
        >
          Paste or open file
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
render(<Popup />, document.getElementById("app")!);
