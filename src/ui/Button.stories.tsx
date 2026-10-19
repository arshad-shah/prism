import { Button } from "./Button";
export default { title: "Prism/Button", component: Button };
export const Default = {
  args: { children: "Open document", onClick: () => {} },
};
export const Disabled = { args: { ...Default.args, disabled: true } };
export const Active = { args: { ...Default.args, pressed: true } };
