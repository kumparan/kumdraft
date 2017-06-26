import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class YoutubeBlock extends Component {
    render() {
        const { url } = this.state;
        return (
            <div className="video-container">
                <iframe width="560" height="315" src={url} frameBorder="0" allowFullScreen />
            </div>
        );
    }
}