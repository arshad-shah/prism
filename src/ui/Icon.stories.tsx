import { Icon } from "./Icon";
import { ICON_PATHS, type IconName } from "../tokens/icons";
export default { title: "Prism/Icon", component: Icon };
export const All = {
  render: () => (
    <div>
      {(Object.keys(ICON_PATHS) as IconName[]).map((name) => (
        <div key={name}>
          <Icon name={name} /> {name}
        </div>
      ))}
    </div>
  ),
};
