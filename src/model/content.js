import {
    EditorState,
    convertFromRaw,
    CompositeDecorator,
} from 'draft-js';

import Link, { findLinkEntities } from '../components/entities/link';
import Linkify, { findValidURL } from '../components/entities/linkify';


const defaultDecorators = new CompositeDecorator([
    {
        strategy: findLinkEntities,
        component: Link,
    },
    {
        strategy: findValidURL,
        component: Linkify
    }
]);


const createEditorState = (content = null, decorators = defaultDecorators) => {
    if (content === null) {
        return EditorState.createEmpty(decorators);
    }
    return EditorState.createWithContent(convertFromRaw(content), decorators);
};


export default createEditorState;