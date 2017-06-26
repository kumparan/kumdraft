import PropTypes from 'prop-types';
import React from 'react';

import { addNewBlock } from '../../model';
import { Block, Entity as E } from '../../util/constants';
import {
    EditorState,
    Entity,
    RichUtils,
    ContentBlock,
    SelectionState,
} from 'draft-js';

export default class LinkButton extends React.Component {
    static propTypes = {
        setEditorState: PropTypes.func.isRequired,
        getEditorState: PropTypes.func.isRequired,
        focus: PropTypes.func
    }
    static defaultProps = {
        focus: () => { }
    }
    constructor() {
        super();
        this.state = {
            urlInputValue: '',
        }
        this.onChange = this._onChange.bind(this);
        this.onClick = this._onClick.bind(this);
        this.onKeyDown = this._onKeyDown.bind(this);
        this.removeLink = this._removeLink.bind(this);
        this.setLink = this._setLink.bind(this);
    }
    _onKeyDown(e) {
        if (e.which === 13) {
            e.preventDefault();
            e.stopPropagation();
            this.setLink(this.state.urlInputValue);
        }
    }
    _onChange(e) {
        if (e.target) {
            this.setState({
                urlInputValue: e.target.value,
            });
        }
    }
    _onClick(linked, editorState, selection, block) {
        const { urlInputValue } = this.state;
        if (linked) {
            // Remove the link
            if (!selection.isCollapsed()) {
                this.removeLink(editorState, selection, block);
            }

        } else {
            this.setLink(urlInputValue);
        }
    }
    /*
    Adds a hyperlink on the selected text with some basic checks.
    */
    _setLink(url) {
        let editorState = this.props.getEditorState();
        const selection = editorState.getSelection();
        const content = editorState.getCurrentContent();
        let entityKey = null;
        let newUrl = url;
        if (url !== '') {
            if (url.indexOf('http') === -1) {
                if (url.indexOf('@') >= 0) {
                    newUrl = `mailto:${newUrl}`;
                } else {
                    newUrl = `http://${newUrl}`;
                }
            }
            const contentWithEntity = content.createEntity(E.LINK, 'MUTABLE', { url: newUrl });
            editorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
            entityKey = contentWithEntity.getLastCreatedEntityKey();
        }
        this.props.setEditorState(RichUtils.toggleLink(editorState, selection, entityKey), this.props.focus);
    }
    _removeLink = (editorState, oldSelection, block) => {
        const blockKey = oldSelection.getStartKey();
        block.findEntityRanges((character) => {
            const eKey = character.getEntity();
            return eKey !== null && Entity.get(eKey).getType() === 'LINK';
        }, (start, end) => {
            const selection = new SelectionState({
                anchorKey: blockKey,
                focusKey: blockKey,
                anchorOffset: start,
                focusOffset: end,
            });
            const newEditorState = EditorState.forceSelection(RichUtils.toggleLink(editorState, selection, null), oldSelection);
            this.props.setEditorState(newEditorState, this.props.focus);
        });
    };
    render() {
        const { urlInputValue } = this.state;

        const editorState = this.props.getEditorState();
        const selection = editorState.getSelection();
        const startKey = selection.getStartKey();
        const content = editorState.getCurrentContent();
        const block = content.getBlockForKey(startKey);
        let linked = false;
        let entityKey = '';
        block.findEntityRanges(
            (character) => {
                entityKey = character.getEntity();
                return entityKey !== null && Entity.get(entityKey).getType() === 'LINK';
            },

            (start, end) => {
                if (block.getKey() === selection.anchorKey && selection.anchorKey === selection.focusKey) {
                    if (selection.anchorOffset >= start && selection.focusOffset <= end) {
                        linked = true;
                    }
                }
            }
        );
        return (
            <div>
                <input
                    ref={ref => this._urlinput = ref}
                    type="text"
                    placeholder="Link"
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown} />
                <button
                    ref={ref => this._button = ref}
                    onClick={() => {
                        this.onClick(linked, editorState, selection, block);
                    }}
                    disabled={urlInputValue === ''}>
                    <i className={`fa fa-${linked ? 'close' : 'link'}`} />
                </button>
            </div>
        );
    }
}