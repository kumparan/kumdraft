import PropTypes from 'prop-types';
import React from 'react';

import { addNewBlock } from '../../model';
import { Block } from '../../util/constants';

export default class ImageButton extends React.Component {
    static propTypes = {
        setEditorState: PropTypes.func.isRequired,
        getEditorState: PropTypes.func.isRequired
    }
    constructor() {
        super();
        this.onClick = this._onClick.bind(this);
        this.onChange = this._onChange.bind(this);
    }
    _onClick() {
        this._input.value = null;
        this._input.click();
    }
    /*
    This is an example of how an image button can be added
    on the side control. This Button handles the image addition locally
    by creating an object url. You can override this method to upload
    images to your server first, then get the image url in return and then
    add to the editor.
    */
    _onChange(e) {
        // e.preventDefault();
        const file = e.target.files[0];
        if (file.type.indexOf('image/') === 0) {
            // eslint-disable-next-line no-undef
            const src = URL.createObjectURL(file);
            this.props.setEditorState(addNewBlock(
                this.props.getEditorState(),
                Block.IMAGE, {
                    src,
                }
            ));
        }
    }
    render() {
        return (
            <button
                className="md-sb-button md-sb-img-button"
                type="button"
                onClick={this.onClick}
                title="Add an Image">
                <i className="fa fa-image" />
                <input
                    type="file"
                    accept="image/*"
                    ref={(c) => { this._input = c; }}
                    onChange={this.onChange}
                    style={{ display: 'none' }}
                />
            </button>
        );
    }
}