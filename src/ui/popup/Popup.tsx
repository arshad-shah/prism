import { useState } from "preact/hooks";
import { Button } from "../Button";
import { PRODUCT } from "../../brand/product";
/** Toolbar popup; platform actions are injected so it renders anywhere. */
export function Popup({
  onOpenPage,
  onOpenWorkspace,
  initialError = "",
}: {
  onOpenPage: () => Promise<void>;
  onOpenWorkspace: () => void;
  initialError?: string;
}) {
  const [error, setError] = useState(initialError);
  return (
    <section class="empty">
      <h1>{PRODUCT.name}</h1>
      <p>Read JSON and XML in one clear workspace.</p>
      <div class="actions">
        <Button
          primary
          onClick={async () => {
            try {
              await onOpenPage();
            } catch {
              setError(
                "This browser page cannot host Prism. Open a document in the workspace.",
              );
            }
          }}
        >
          Open on this page
        </Button>
        <Button onClick={onOpenWorkspace}>Paste or open file</Button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
