import { Toolbar } from "./Toolbar";
import { Button } from "./Button";
export default { title: "Prism/Toolbar", component: Toolbar };
export const Default = {
  render: () => (
    <Toolbar>
      <strong>Prism</strong>
      <Button onClick={() => {}}>Tree</Button>
      <Button onClick={() => {}}>Raw</Button>
    </Toolbar>
  ),
};
