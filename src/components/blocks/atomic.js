import PropTypes from 'prop-types';
// import './atomic.scss';

import React, { Component } from 'react';
import { Map } from 'immutable';
import { EditorBlock, EditorState, Entity, SelectionState } from 'draft-js';

export default class AtomicBlock extends Component {
    static propTypes = {
        block: PropTypes.object,
        getEditorState: PropTypes.func,
    };
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
    };
    render() {
        const entity = Entity.get(this.props.block.getEntityAt(0));
        const type = entity.getType();
        // const content = props.blockProps.getEditorState().getCurrentContent();
        // const entity = content.getEntity(props.block.getEntityAt(0));
        // const data = entity.getData();
        // const type = entity.getType();
        if (type === 'image') {
            return (
                <div className="md-block-atomic-wrapper">
                    <img role="presentation" src={data.src} />
                    <div className="md-block-atomic-controls">
                        <button>&times;</button>
                    </div>
                </div>
            );
        }
        if (type === 'youtube') {
            const { src } = entity.getData();
            return (
                <div className="video-container">
                    <iframe width="560" height="315" src={src} frameBorder="0" allowFullScreen />
                </div>
            );
        }
        return <p>No supported block for {type}</p>;
    }
};