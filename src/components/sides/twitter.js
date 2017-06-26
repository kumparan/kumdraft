import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { addNewBlock } from '../../model';
import { Block } from '../../util/constants';
import MatchTwitterURL from '../../helpers/MatchTwitterURL';

export default class TwitterButton extends Component {
    static propTypes = {
        setEditorState: PropTypes.func,
        getEditorState: PropTypes.func
    };

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
            const isValid = MatchTwitterURL(url);
            if (isValid) {
                const urlRegExp = new RegExp(/https:\/\/twitter.com\/[a-zA-Z0-9:;\.\s\(\)\-\\_,]*\/status\//gi);
                const urlRegExp2 = new RegExp(/\/[a-zA-Z0-9:;\.\s\(\)\-\\_,\?,\=,\%]*/gi);
                this.props.setEditorState(addNewBlock(
                    this.props.getEditorState(),
                    Block.TWITTER, {
                        id: url.replace(urlRegExp, '').replace(urlRegExp2, '')
                    }
                ));
            } else {
                alert('Not a Twitter url');
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
                    placeholder="Embed Twitter"
                    value={url}
                    onChange={this.onChange} />
                <button
                    ref={ref => this._button = ref}
                    onClick={this.onClick}
                    disabled={url === ''}>
                    <i className="fa fa-twitter" />
                </button>
            </div>
        );
    }
}