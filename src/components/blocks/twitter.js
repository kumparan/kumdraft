import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorBlock, EditorState, SelectionState } from 'draft-js';

var callbacks = [];

function addScript(src, cb) {
    if (callbacks.length === 0) {
        callbacks.push(cb)
        var s = document.createElement('script')
        s.setAttribute('src', src)
        s.onload = () => callbacks.forEach((cb) => cb())
        document.body.appendChild(s)
    } else {
        callbacks.push(cb)
    }
}

class TwitterBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderHTML: <blockquote className="twitter-tweet tw-align-center" style={{ maxWidth: '300px', margin: '0 auto' }} >
                <a ref={(c) => this._div = c}></a>
            </blockquote>
        };
        this.focusBlock = this._focusBlock.bind(this);
    }
    componentDidMount() {
        const { block } = this.props;
        const blockData = block.getData();
        const data = blockData.get('data');
        console.log(data);
        const renderTweet = () => {
            // const url = 'https://twitter.com/BiLLYKOMPAS/status/773015630039482372'
            window.twttr.widgets.createTweet(data.id, this._div).then((resolve, reject) => {
                console.log('added');
                if (typeof (resolve) === 'undefined') {
                    console.log('Tweet is not available');
                    this.setState({
                        renderHTML: <blockquote className="twitter-tweet tw-align-center" style={{ maxWidth: '300px', margin: '0 auto' }} >
                            <h2>Tweet is not available</h2>
                        </blockquote>
                    })
                }
            })
        }
        if (!window.twttr) {
            addScript('//platform.twitter.com/widgets.js', renderTweet);
        } else {
            renderTweet();
        }
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
        const { renderHTML } = this.state;
        return (
            <div>
                {renderHTML}
                <EditorBlock {...this.props} />
            </div>
        );
    }
}

TwitterBlock.propTypes = {
    id: PropTypes.string
}

export default TwitterBlock;
