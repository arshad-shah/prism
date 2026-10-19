import {styles} from '../src/ui/styles';
import {cssVars} from '../src/tokens';
export default {parameters:{a11y:{test:'error'}},decorators:[(Story:()=>import('preact').ComponentChildren)=><div style={{height:'90vh',...Object.fromEntries(cssVars('light').split(';').map(pair=>pair.split(':')))}}><style>{styles}</style><Story/></div>]};
