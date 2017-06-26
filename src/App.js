import React, { Component } from 'react';
import { render } from 'react-dom';
import {
  EditorState,
  convertToRaw,
  KeyBindingUtil,
} from 'draft-js';
import {
  Editor,
  StringToTypeMap,
  Block,
  keyBindingFn,
  createEditorState,
  addNewBlockAt,
  beforeInput,
  getCurrentBlock,
  rendererFn,
  HANDLED,
  NOT_HANDLED
} from './KumDraft';
// import KumDraft from './KumDraft';
import MatchTwitterURL from './helpers/MatchTwitterURL';
import MatchYoutubeURL from './helpers/MatchYoutubeURL';

import BreakButton from './components/sides/break';
import ImageButton from './components/sides/image';
import LinkButton from './components/sides/link';
import TwitterButton from './components/sides/twitter';
import YoutubeButton from './components/sides/youtube';

const newTypeMap = StringToTypeMap;
newTypeMap['2.'] = Block.OL;
const { hasCommandModifier } = KeyBindingUtil;

class App extends Component {
  constructor() {
    super();
    this.state = {
      readOnly: false,
      editorState: createEditorState(),
      editorEnabled: true,
      placeholder: 'Write here...',
    };
    this.focus = this._focus.bind(this);
    this.handleReturn = this._handleReturn.bind(this);
    this.handleBeforeInput = this._handleBeforeInput.bind(this);
    this.onChange = this._onChange.bind(this);
  }
  componentDidMount() {
    this.focus();
  }
  _focus() {
    this._editor.focus();
  }
  _onChange(editorState, callback = null) {
    if (this.state.editorEnabled) {
      this.setState({ editorState }, () => {
        if (callback) {
          callback();
        }
      });
    }
  };
  _handleReturn(e) {
    // const currentBlock = getCurrentBlock(this.state.editorState);
    // var text = currentBlock.getText();
    return NOT_HANDLED;
  }
  _handleBeforeInput(editorState, str, onChange) {
    if (str === '"' || str === '\'') {
      const currentBlock = getCurrentBlock(editorState);
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const text = currentBlock.getText();
      const len = text.length;
      if (selectionState.getAnchorOffset() === 0) {
        onChange(EditorState.push(editorState, Modifier.insertText(contentState, selectionState, (str === '"' ? DQUOTE_START : SQUOTE_START)), 'transpose-characters'));
        return HANDLED;
      } else if (len > 0) {
        const lastChar = text[len - 1];
        if (lastChar !== ' ') {
          onChange(EditorState.push(editorState, Modifier.insertText(contentState, selectionState, (str === '"' ? DQUOTE_END : SQUOTE_END)), 'transpose-characters'));
        } else {
          onChange(EditorState.push(editorState, Modifier.insertText(contentState, selectionState, (str === '"' ? DQUOTE_START : SQUOTE_START)), 'transpose-characters'));
        }
        return HANDLED;
      }
    }
    return beforeInput(editorState, str, onChange, newTypeMap);
  };
  render() {
    const { editorEnabled, editorState, placeholder } = this.state;
    return (
      <div>
        <div>
          <button onClick={() => {
            const content = editorState.getCurrentContent();
            console.log(convertToRaw(content));
          }}>Log State</button>
          <button onClick={() => {
            this.setState({ editorEnabled: !this.state.editorEnabled });
          }}>{editorEnabled ? 'Disable Editor' : 'Enable Editor'}</button>
        </div>
        <ImageButton
          setEditorState={this.onChange}
          getEditorState={() => this.state.editorState} />
        <BreakButton
          setEditorState={this.onChange}
          getEditorState={() => this.state.editorState} />
        <TwitterButton
          setEditorState={this.onChange}
          getEditorState={() => this.state.editorState} />
        <YoutubeButton
          setEditorState={this.onChange}
          getEditorState={() => this.state.editorState} />
        <LinkButton
          setEditorState={this.onChange}
          getEditorState={() => this.state.editorState}
          focus={this.focus} />
        <div style={{ borderTop: '1px solid black', paddingTop: 8 }}>
          <Editor
            ref={(e) => { this._editor = e; }}
            editorState={editorState}
            onChange={this.onChange}
            editorEnabled={editorEnabled}
            placeholder={placeholder}
            keyBindingFn={keyBindingFn}
            beforeInput={this.handleBeforeInput}
            handleReturn={this.handleReturn}
          />
        </div>
      </div>
    );
  }
}

render(
  <App />,
  document.getElementById('content')
);