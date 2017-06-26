import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { EditorBlock, EditorState, SelectionState } from 'draft-js';
import { getCurrentBlock } from '../../model/';

export default class YoutubeBlock extends Component {
    static propTypes = {
        block: PropTypes.object,
        blockProps: PropTypes.object,
    }
    constructor(props) {
        super(props);
        this.focusBlock = this._focusBlock.bind(this);
    }
    _focusBlock() {
        const { block, blockProps } = this.props;
        const { getEditorState, setEditorState } = blockProps;
        const key = block.getKey();
        const editorState = getEditorState();
        const currentblock = getCurrentBlock(editorState);
        if (currentblock.getKey() === key) {
            return;
        }
        const newSelection = new SelectionState({
            anchorKey: key,
            focusKey: key,
            anchorOffset: 0,
            focusOffset: 0,
        });
        setEditorState(EditorState.forceSelection(editorState, newSelection));
    }
    render() {
        const { block } = this.props;
        const data = block.getData();
        const src = data.get('src');
        if (src !== null) {
            return (
                <div>
                    <div className="videoWrapper">
                        <iframe width="560" height="349" src={src} frameBorder="0" allowFullScreen />
                    </div>
                    <figcaption>
                        <EditorBlock {...this.props} />
                    </figcaption>
                </div>
            );
        }
        return <EditorBlock {...this.props} />;
    }
}