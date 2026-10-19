import {ALIASES} from '../build/shared';
export default {core:{disableTelemetry:true},stories:['../src/**/*.stories.tsx'],framework:{name:'@storybook/react-vite',options:{}},addons:['@storybook/addon-a11y'],viteFinal:(config:{resolve?:{alias?:Record<string,string>}})=>({...config,resolve:{...config.resolve,alias:{...config.resolve?.alias,...ALIASES}}})};
