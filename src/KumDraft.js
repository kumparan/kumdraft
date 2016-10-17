import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import { AtomicBlockUtils, Editor, EditorState, Entity, RichUtils, ContentBlock, convertToRaw, convertFromRaw, CompositeDecorator, DefaultDraftBlockRenderMap, Modifier } from 'draft-js';

import ToHHMMSS from './helpers/ToHHMMSS';

import { Map, fromJS } from 'immutable';
import { default as Video, Controls, Play, Mute, Seek, Fullscreen, Time, Overlay } from 'react-html5video';
import Button from 'react-bootstrap/lib/Button';
import Twitter from './components/Twitter';

class KumDraft extends Component {
  constructor(props) {
    super(props);
    this.state = this.resetState(props);
    this.blockRenderMap = DefaultDraftBlockRenderMap.merge(
      customBlockRendering(props)
    );
    this.focus = this._focus.bind(this);
    this.onChange = props.onChange;

    this.mediaBlockRenderer = this._mediaBlockRenderer.bind(this);

    this.handleLink = this._handleLink.bind(this);
    this.confirmLink = this._confirmLink.bind(this);

    this.confirmImage = this._confirmImage.bind(this);
    this.confirmVideo = this._confirmVideo.bind(this);
  }

  resetState(props) {
    return {
      modalType: '',
      subModalType: '',
    }
  };

  _focus(event) {
    this._editor.focus();
  };

  _mediaBlockRenderer(block) {
    const { readOnly } = this.props;
    if (block.getType() === 'atomic') {
      return {
        component: Media,
        editable: false,
        props: {
          readOnly: readOnly,
          updateSpecialQuote: this.updateSpecialQuote
        }
      };
    }

    return null;
  };

  _handleLink() {
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const block = editorState.getCurrentContent().getBlockForKey(startKey);
    let active = false;
    block.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && Entity.get(entityKey).getType() === 'link';
      },

      (start, end) => {
        if (block.getKey() === selection.anchorKey && selection.anchorKey === selection.focusKey) {
          if (selection.anchorOffset >= start && selection.focusOffset <= end) {
            active = true;
          }
        }
      }
    );
    if (active) {
      // Remove the link
      if (!selection.isCollapsed()) {
        this.onChange(RichUtils.toggleLink(editorState, selection, null));
      }
    } else {
      this.setState({ modalType: 'link' });
    }
  }

  _confirmLink() {
    const url = document.getElementById('url');
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    if (url.value.length > 0 || url.value !== '') {
      const entityKey = Entity.create('link', 'MUTABLE', { href: url.value });
      const contentState = editorState.getCurrentContent();
      const newEditorState = EditorState.set(editorState, { currentContent: contentState });
      this.onChange(
        RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey)
      );
      this.setState({ modalType: '' });
    } else {
      alert('Please complete the form');
    }
  };

  _confirmImage(e, url, caption) {
    const { editorState } = this.props;
    const data = {
      "url": url
    };
    if (caption) {
      data.caption = { text: caption };
    }
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

  _confirmYoutube(url) {
    const { editorState } = this.props;
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
    this.setState({
      modalType: '',
      subModalType: '',
    }, () => {
      setTimeout(() => this.focus(), 0);
    });
  }

  _confirmTwitter(url) {
    const { editorState } = this.props;
    const { mediaType } = this.state;
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
    this.setState({
      modalType: '',
      subModalType: ''
    }, () => {
      setTimeout(() => this.focus(), 0);
    });
  };

  _confirmVideo(url, caption) {
    const data = {
      "url": url,
    };
    if (caption) {
      data.caption = { text: caption };
    }
    const { editorState } = this.props;
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

  render() {
    const { editorState, readOnly } = this.props;
    const { modalType, subModalType, imagesList, videosList } = this.state;
    /* for bucket-color's selected color' */
    let pickedColor = { color: '#FFF' };
    if (editorState.getCurrentInlineStyle().has('red')) { pickedColor = customStyleMap.red; }
    if (editorState.getCurrentInlineStyle().has('blue')) { pickedColor = customStyleMap.blue; }
    if (editorState.getCurrentInlineStyle().has('tosca')) { pickedColor = customStyleMap.tosca; }
    if (editorState.getCurrentInlineStyle().has('gray')) { pickedColor = customStyleMap.gray; }
    if (editorState.getCurrentInlineStyle().has('grayLight')) { pickedColor = customStyleMap.grayLight; }
    if (editorState.getCurrentInlineStyle().has('green')) { pickedColor = customStyleMap.green; }
    if (editorState.getCurrentInlineStyle().has('yellow')) { pickedColor = customStyleMap.yellow; }
    if (editorState.getCurrentInlineStyle().has('orange')) { pickedColor = customStyleMap.orange; }
    /* end of bucket-color's selected color */

    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const block = editorState.getCurrentContent().getBlockForKey(startKey);
    let linked = false;
    block.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && Entity.get(entityKey).getType() === 'link';
      },

      (start, end) => {
        if (block.getKey() === selection.anchorKey && selection.anchorKey === selection.focusKey) {
          if (selection.anchorOffset >= start && selection.focusOffset <= end) {
            linked = true;
          }
        }
      }
    );

    const videoPublicId = 'bom_thamrin.mp4';
    return (
      <div onClick={this.focus}>
        <Editor
          placeholder="Type anything"
          readOnly={readOnly}
          customStyleMap={customStyleMap}
          blockRenderMap={this.blockRenderMap}
          blockRendererFn={this.mediaBlockRenderer}
          blockStyleFn={myBlockStyleFn}
          editorState={editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          ref={ref => this._editor = ref}
          />
      </div>
    )
  }
}

const customBlockRendering = (props) => {
  const { blockTypes } = props;
  var newObj = {
    'paragraph': {
      element: 'div',
    },
    'unstyled': {
      element: 'div',
    },
    'align-left': {
      element: 'div'
    },
    'align-center': {
      element: 'div'
    },
    'align-right': {
      element: 'div'
    },
    'align-justify': {
      element: 'div'
    }
  };
  for (var key in blockTypes) {
    newObj[key] = {
      element: 'div'
    };
  } return Map(newObj);
}

const myBlockStyleFn = (contentBlock) => {
  const type = contentBlock.getType();
  if (type === 'unstyled') {
    return 'editor-padding-8';
  } else if (type === 'align-left') {
    // To make this work make sure to remove text-align from .public-DraftStyleDefault-ltr{direction:ltr;text-align:left} in DraftJS.css
    return 'editor-padding-8 text-left';
  } else if (type === 'align-center') {
    // To make this work make sure to remove text-align from .public-DraftStyleDefault-ltr{direction:ltr;text-align:left} in DraftJS.css
    return 'editor-padding-8 text-center';
  } else if (type === 'align-right') {
    // To make this work make sure to remove text-align from .public-DraftStyleDefault-ltr{direction:ltr;text-align:left} in DraftJS.css
    return 'editor-padding-8 text-right';
  } else if (type === 'align-justify') {
    // To make this work make sure to remove text-align from .public-DraftStyleDefault-ltr{direction:ltr;text-align:left} in DraftJS.css
    return 'editor-padding-8 text-justify';
  }
}

// This object provides the styling information for our custom styles.
const colorStyle = {

}

const inlineStyle = {

}
const customStyleMap = {
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
  'h2': {
    fontSize: '30px',
    marginTop: '20px',
    marginBottom: '10px'
  },
  'h3': {
    fontSize: '24px',
    marginTop: '20px',
    marginBottom: '10px'
  },
  'subscript': {
    verticalAlign: 'sub',
    fontSize: 'smaller',
  },
  'superscript': {
    verticalAlign: 'super',
    fontSize: 'smaller',
  }
};

const Media = (props) => {
  const entity = Entity.get(props.block.getEntityAt(0));
  const {src} = entity.getData();
  const type = entity.getType();

  let media;
  if (type === 'image') {
    const { url } = entity.getData();
    media = <div>
      <img src={url} width="100%" />
    </div>;
  } else if (type === 'youtube') {
    const { url } = entity.getData();
    media = <div className="video-container">
      <iframe width="560" height="315" src={url} frameBorder="0" allowFullScreen />
    </div>;
  } else if (type === 'twitter') {
    const { id } = entity.getData();
    media = <Twitter id={id} />;
  } else if (type === 'video') {
    const { url } = entity.getData();
    media = <div>
      <Video style={{ width: '100%' }} controls>
        <source src={url} type="video/mp4" />
        <Overlay />
        <Controls>
          <Play />
          <Seek />
          <Time />
          <Mute />
          <Fullscreen />
        </Controls>
      </Video>
    </div>;
  }

  return media;
};

KumDraft.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool
}

KumDraft.defaultProps = {
  onChange: () => { },
  readOnly: false
}

export default KumDraft;