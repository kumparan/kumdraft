import PropTypes from 'prop-types';
import React from 'react';

import { Entity } from '../../util/constants';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';

const _linkifyIt = linkifyIt();
_linkifyIt.tlds(tlds);

export const findValidURL = (contentBlock, callback) => {
  const links = _linkifyIt.match(contentBlock.get('text'));
  if (typeof links !== 'undefined' && links !== null) {
    for (let i = 0; i < links.length; i += 1) {
      callback(links[i].index, links[i].lastIndex);
    }
  }
}

const Linkify = (props) => {
  console.log('propschildren', props);
  const decoratedText = props.decoratedText;
  console.log(decoratedText);
  const links = _linkifyIt.match(decoratedText);
  const href = links && links[0] ? links[0].url : '';
  return (<a 
            className="color-primary" 
            href={href} 
            rel="noopener noreferrer"
            target="_blank"
            aria-label={href}>{props.children}</a>);
}

const Link = (props) => {
    const { contentState, entityKey } = props;
    const { url } = contentState.getEntity(entityKey).getData();
    return (
        <a
            className="md-link"
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            aria-label={url}
        >{props.children}</a>
    );
};

Linkify.propTypes = {
    children: PropTypes.node,
    entityKey: PropTypes.string,
    contentState: PropTypes.object.isRequired,
};

export default Linkify;