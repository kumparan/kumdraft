import React, { Component } from "react";
import { render } from "react-dom";
import { AtomicBlockUtils, convertToRaw, EditorState, Entity, Modifier, RichUtils } from 'draft-js';
import KumDraft from './KumDraft';
import MatchTwitterURL from './helpers/MatchTwitterURL';
import MatchYoutubeURL from './helpers/MatchYoutubeURL';

class App extends Component {
  constructor() {
    super();
    this.state = {
      editorState: EditorState.createEmpty(),
      readOnly: false
    };
    this.onChange = this._onChange.bind(this);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.undo = this._undo.bind(this);
    this.redo = this._redo.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.toggleColor = this._toggleColor.bind(this);
    this.toggleHSuperSub = this._toggleHSuperSub.bind(this);

    this.confirmImage = this._confirmImage.bind(this);
    this.confirmVideo = this._confirmVideo.bind(this);
    this.confirmTwitter = this._confirmTwitter.bind(this);
    this.confirmYoutube = this._confirmYoutube.bind(this);
  }

  _onChange(editorState) {
    this.setState({ editorState });
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  };

  _undo(event) {
    event.preventDefault();
    const { editorState } = this.state;
    this.onChange(EditorState.undo(editorState));
  };

  _redo(event) {
    event.preventDefault();
    const { editorState } = this.state;
    this.onChange(EditorState.redo(editorState));
  };

  _toggleBlockType(blockType) {
    const { editorState } = this.state;
    this.onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    );
  };

  _toggleInlineStyle(inlineStyle) {
    const { editorState } = this.state;
    if (inlineStyle === 'red' || inlineStyle === 'blue' || inlineStyle === 'tosca' || inlineStyle === 'black' || inlineStyle === 'gray' || inlineStyle === 'grayLight' || inlineStyle === 'green' || inlineStyle === 'yellow' || inlineStyle === 'orange') {
      this.toggleColor(inlineStyle, editorState, this.onChange);
    } else if (inlineStyle === 'superscript' || inlineStyle === 'subscript' || inlineStyle === 'h1' || inlineStyle === 'h2'|| inlineStyle === 'h3') {
      this.toggleHSuperSub(inlineStyle, editorState, this.onChange);
    } else {
      this.onChange(
        RichUtils.toggleInlineStyle(
          editorState,
          inlineStyle
        )
      );
    }
  };

  _toggleColor(toggledColor, editorState, setEditorState) {
    const selection = editorState.getSelection();
    const INLINE_STYLES = {
      'red': {
        color: '#d0021b',
      },
      'blue': {
        color: '#00CFDB',
      },
      'tosca': {
        color: '#00A5AF',
      },
      'black': {
        color: '#333',
      },
      'gray': {
        color: '#555',
      },
      'grayLight': {
        color: '#808080',
      },
      'green': {
        color: '#91D140',
      },
      'yellow': {
        color: '#FECB00',
      },
      'orange': {
        color: '#F9B42D',
      },
    };

    // Let's just allow one hsupersub at a time. Turn off all active hsupersub.
    const nextContentState = Object.keys(INLINE_STYLES)
      .reduce((contentState, color) => {
        return Modifier.removeInlineStyle(contentState, selection, color)
      }, editorState.getCurrentContent());

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    const currentStyle = editorState.getCurrentInlineStyle();

    // Unset style override for current color.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, color);
      }, nextEditorState);
    }

    // If the color is being toggled on, apply it.
    if (!currentStyle.has(toggledColor)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledColor
      );
    }

    setEditorState(nextEditorState);
  };

  _toggleHSuperSub(toggledHSuperSub, editorState, setEditorState) {
    const selection = editorState.getSelection();
    const INLINE_STYLES = {
      superscript: {
        verticalAlign: 'super',
        fontSize: 'smaller'
      },
      subscript: {
        verticalAlign: 'sub',
        fontSize: 'smaller'
      },
      h1: {
        fontSize: '36px',
        marginTop: '20px',
        marginBottom: '10px'
      },
      h2: {
        fontSize: '30px',
        marginTop: '20px',
        marginBottom: '10px'
      },
      h3: {
        fontSize: '24px',
        marginTop: '20px',
        marginBottom: '10px'
      }
    };

    // Let's just allow one hsupersub at a time. Turn off all active hsupersub.
    const nextContentState = Object.keys(INLINE_STYLES)
      .reduce((contentState, supersub) => {
        return Modifier.removeInlineStyle(contentState, selection, supersub)
      }, editorState.getCurrentContent());

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    const currentStyle = editorState.getCurrentInlineStyle();

    // Unset style override for current hsupersub.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, supersub) => {
        return RichUtils.toggleInlineStyle(state, supersub);
      }, nextEditorState);
    }

    // If the hsupersub is being toggled on, apply it.
    if (!currentStyle.has(toggledHSuperSub)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledHSuperSub
      );
    }

    setEditorState(nextEditorState);
  };

  _confirmImage(url) {
    const { editorState } = this.state;
    const data = {
      "url": url
    };
    const entityKey = Entity.create('image', 'IMMUTABLE', data);
    this.onChange(
      AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' '
      )
    );
    this.setState({
      modalType: '',
      subModalType: ''
    }, () => {
      setTimeout(() => this.focus(), 0);
    });
  }

  _confirmVideo(url) {
    const data = {
      "url": url,
    };
    const { editorState } = this.state;
    const { urlValue, urlType} = this.state;
    const entityKey = Entity.create('video', 'IMMUTABLE', data);
    this.onChange(
      AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
      )
    );
    this.setState({
      modalType: '',
      subModalType: '',
    }, () => {
      setTimeout(() => this.focus(), 0);
    });
  };

  _confirmTwitter(url) {
    const { editorState } = this.state;
    const urlRegExp = new RegExp(/https:\/\/twitter.com\/[a-zA-Z0-9:;\.\s\(\)\-\\_,]*\/status\//gi);
    const urlRegExp2 = new RegExp(/\/[a-zA-Z0-9:;\.\s\(\)\-\\_,\?,\=,\%]*/gi);
    const data = {
      "id": url.replace(urlRegExp, '').replace(urlRegExp2, '')
    };
    const entityKey = Entity.create('twitter', 'IMMUTABLE', data);
    this.onChange(
      AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
      )
    );
  };

  _confirmYoutube(url) {
    const { editorState } = this.state;
    const finalUrl = url.replace('/watch?v=', '/embed/');
    const data = {
      "url": finalUrl
    };
    const entityKey = Entity.create('youtube', 'IMMUTABLE', data);
    this.onChange(
      AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
      )
    );
  }

  render() {
    const { editorState } = this.state;
    return (
      <div>
        <div>
          <button onClick={this.undo} disabled={editorState.getUndoStack().isEmpty()}>
            <i className="fa fa-undo" />
          </button>
          <button onClick={this.redo} disabled={editorState.getRedoStack().isEmpty()}>
            <i className="fa fa-repeat" />
          </button>
          <button onClick={() => this.toggleInlineStyle('BOLD')}>
            <i className="fa fa-bold" />
          </button>
          <button onClick={() => this.toggleInlineStyle('ITALIC')}>
            <i className="fa fa-italic" />
          </button>
          <button onClick={() => this.toggleInlineStyle('h1')}>
            H1
          </button>
          <button onClick={() => this.toggleInlineStyle('h2')}>
            H2
          </button>
          <button onClick={() => this.toggleInlineStyle('h3')}>
            H3
          </button>
          <button onClick={() => this.toggleInlineStyle('superscript')}>
            <i className="fa fa-superscript" />
          </button>
          <button onClick={() => this.toggleInlineStyle('subscript')}>
            <i className="fa fa-subscript" />
          </button>
          <button onClick={() => this.toggleBlockType('align-left')}>
            <i className="fa fa-align-left" />
          </button>
          <button onClick={() => this.toggleBlockType('align-center')}>
            <i className="fa fa-align-center" />
          </button>
          <button onClick={() => this.toggleBlockType('align-right')}>
            <i className="fa fa-align-right" />
          </button>
          <button onClick={() => this.toggleBlockType('align-justify')}>
            <i className="fa fa-align-justify" />
          </button>
        </div>
        <div>
          <button onClick={() => this.toggleInlineStyle('red')}>
            <span style={{ color: '#d0021b' }}>Red</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('blue')}>
            <span style={{ color: '#00CFDB' }}>Blue</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('tosca')}>
            <span style={{ color: '#00A5AF' }}>Tosca</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('black')}>
            <span style={{ color: '#000' }}>Black</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('gray')}>
            <span style={{ color: '#555' }}>Gray</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('grayLight')}>
            <span style={{ color: '#808080' }}>Gray Light</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('green')}>
            <span style={{ color: '#91D140' }}>Green</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('yellow')}>
            <span style={{ color: '#FECB00' }}>Yellow</span>
          </button>
          <button onClick={() => this.toggleInlineStyle('orange')}>
            <span style={{ color: '#F9B42D' }}>Orange</span>
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Embed Image"
            ref={ref => this._embedImage = ref}
            onChange={(event) => {
              if (event.target.value !== '' && event.target.value.length > 0) {
                this._btnImage.disabled = '';
              } else {
                this._btnImage.disabled = 'disabled';
              }
            } } />
          <button
            ref={ref => this._btnImage = ref}
            onClick={() => this.confirmImage(this._embedImage.value)}
            disabled>
            <i className="fa fa-picture-o" />
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Embed Video"
            ref={ref => this._embedVideo = ref}
            onChange={(event) => {
              if (event.target.value !== '' && event.target.value.length > 0) {
                this._btnVideo.disabled = '';
              } else {
                this._btnVideo.disabled = 'disabled';
              }
            } } />
          <button
            ref={ref => this._btnVideo = ref}
            onClick={() => this.confirmVideo(this._embedVideo.value)}
            disabled>
            <i className="fa fa-video-camera" />
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Embed Twitter"
            ref={ref => this._embedTwitter = ref}
            onChange={(event) => {
              if (event.target.value !== '' && event.target.value.length > 0) {
                this._btnTwitter.disabled = '';
              } else {
                this._btnTwitter.disabled = 'disabled';
              }
            } } />
          <button
            ref={ref => this._btnTwitter = ref}
            onClick={() => {
              if (this._embedTwitter.value !== '' && this._embedTwitter.value.length > 0) {
                this._btnTwitter.disabled = '';
                const id = MatchTwitterURL(this._embedTwitter.value);
                if (id !== false) {
                  this.confirmTwitter(this._embedTwitter.value)
                } else {
                  alert('Not a Twitter url');
                }
              }
            } }
            disabled>
            <i className="fa fa-twitter" />
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Embed Youtube"
            ref={ref => this._embedYoutube = ref}
            onChange={(event) => {
              if (event.target.value !== '' && event.target.value.length > 0) {
                this._btnYoutube.disabled = '';
              } else {
                this._btnYoutube.disabled = 'disabled';
              }
            } } />
          <button
            ref={ref => this._btnYoutube = ref}
            onClick={() => {
              if (this._embedYoutube.value !== '' && this._embedYoutube.value.length > 0) {
                this._btnTwitter.disabled = '';
                const id = MatchYoutubeURL(this._embedYoutube.value);
                if (id !== false) {
                  this.confirmYoutube(this._embedYoutube.value)
                } else {
                  alert('Not a Youtube url');
                }
              }
            } }
            disabled>
            <i className="fa fa-youtube" />
          </button>
        </div>
        <div style={{ borderTop: '1px solid black' }}>
          <KumDraft editorState={this.state.editorState} onChange={this.onChange} readOnly={this.state.readOnly} />
        </div>
      </div>
    );
  }
}

render(
  <App />,
  document.getElementById('content')
);