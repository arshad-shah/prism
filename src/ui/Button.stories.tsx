import { Button } from "./Button";
export default { title: "Prism/Button", component: Button };
export const Default = {
  args: { children: "Open document", onClick: () => {} },
};
export const Disabled = { args: { ...Default.args, disabled: true } };
export const Active = { args: { ...Default.args, pressed: true } };
export const Primary = { args: { ...Default.args, primary: true } };
export const WithIcon = { args: { ...Default.args, icon: "folder" } };
export const IconOnly = {
  args: { icon: "copy", label: "Copy document", onClick: () => {} },
};
export const IconOnlyPressed = {
  args: {
    icon: "regex",
    label: "Regular expression",
    pressed: true,
    onClick: () => {},
  },
};
