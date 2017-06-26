import Editor from './Editor';

import beforeInput, { StringToTypeMap } from './util/beforeinput';
import RenderMap from './util/rendermap';
import Link, { findLinkEntities } from './components/entities/link';
import keyBindingFn from './util/keybinding';
import rendererFn from './components/customrenderer';
import customStyleMap from './util/customstylemap';
import createEditorState from './model/content';

export { Block, Inline, Entity, HANDLED, NOT_HANDLED } from './util/constants';

export {
    getDefaultBlockData,
    getCurrentBlock,
    addNewBlock,
    resetBlockWithType,
    updateDataOfBlock,
    addNewBlockAt,
} from './model';

// eslint-disable-next-line no-undef
// export const _version = __VERSION__;

export {
    Editor,
    createEditorState,
    StringToTypeMap,
    RenderMap,
    Link,
    findLinkEntities,
    beforeInput,
    customStyleMap,
    keyBindingFn,
    rendererFn,
};

export default Editor