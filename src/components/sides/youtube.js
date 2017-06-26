import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AtomicBlockUtils, Entity } from 'draft-js';

import { addNewBlock } from '../../model';
import { Block } from '../../util/constants';
import MatchYoutubeURL from '../../helpers/MatchYoutubeURL';

export default class YoutubeButton extends Component {
    static propTypes = {
        setEditorState: PropTypes.func.isRequired,
        getEditorState: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {
            url: ''
        }
        this.onClick = this._onClick.bind(this);
        this.onChange = this._onChange.bind(this);
    }
    _onClick() {
        const { url } = this.state;
        if (url !== '' && url.length > 0) {
            const isValid = MatchYoutubeURL(url);
            if (isValid) {
                const src = url.replace('/watch?v=', '/embed/');
                const data = { src };
                // const entityKey = Entity.create('youtube', 'IMMUTABLE', data);
                // this.props.setEditorState(
                //     AtomicBlockUtils.insertAtomicBlock(
                //         this.props.getEditorState(),
                //         entityKey,
                //         ' ',
                //     )
                // );
                this.props.setEditorState(addNewBlock(
                    this.props.getEditorState(),
                    Block.YOUTUBE, {
                        src
                    }
                ));
            } else {
                alert('Not a Youtube url');
            }
        }
    }
    _onChange(event) {
        this.setState({ url: event.currentTarget.value });
    }
    render() {
        const { url } = this.state;
        return (
            <div>
                <input
                    type="text"
                    placeholder="Embed Youtube"
                    value={url}
                    onChange={this.onChange} />
                <button
                    ref={ref => this._button = ref}
                    onClick={this.onClick}
                    disabled={url === ''}>
                    <i className="fa fa-youtube" />
                </button>
            </div>
        );
    }
}