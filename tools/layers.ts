import ts from "typescript";
import { readdir, readFile } from "node:fs/promises";
const errors: string[] = [];
async function walk(path: string): Promise<void> {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = `${path}/${entry.name}`;
    if (entry.isDirectory()) await walk(file);
    else if (/\.(ts|tsx)$/.test(file) && !file.endsWith(".d.ts")) {
      const text = await readFile(file, "utf8");
      if (
        file.startsWith("src/ui/") &&
        !file.includes("/popup/") &&
        !file.includes(".stories.")
      ) {
        const tree = ts.createSourceFile(
          file,
          text,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TSX,
        );
        const inspect = (node: ts.Node) => {
          if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.expression) &&
            ["chrome", "browser"].includes(node.expression.text)
          )
            errors.push(`${file}: browser API outside platform`);
          ts.forEachChild(node, inspect);
        };
        inspect(tree);
        if (/#[0-9a-f]{3,8}\b|\b\d+px\b/i.test(text))
          errors.push(`${file}: token literal in UI`);
        if (
          !file.endsWith("styles.ts") &&
          !file.includes(".stories.") &&
          !(await readFile(
            file.replace(/\.tsx$/, ".stories.tsx"),
            "utf8",
          ).catch(() => ""))
        )
          errors.push(`${file}: missing story`);
      }
      if (
        file.startsWith("src/core/") &&
        /from ["'][^"']*(ui|platform|state|formats)/.test(text) &&
        !file.endsWith("parse.ts")
      )
        errors.push(`${file}: upward dependency`);
    }
  }
}
await walk("src");
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "UI boundaries, tokens, stories and core dependency directions verified.",
);
