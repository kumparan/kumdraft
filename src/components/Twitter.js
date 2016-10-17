import React, { Component, PropTypes } from 'react'

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

class Twitter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderHTML: <blockquote className="twitter-tweet tw-align-center" style={{ maxWidth: '300px', margin: '0 auto' }} >
        <a ref={(c) => this._div = c}></a>
      </blockquote>
    }
  }
  componentDidMount() {
    const renderTweet = () => {
      // const url = 'https://twitter.com/BiLLYKOMPAS/status/773015630039482372'
      window.twttr.widgets.createTweet(this.props.id, this._div).then((resolve, reject) => {
        console.log('added');
        console.log(resolve);
        console.log(reject);
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
  render() {
    const { renderHTML } = this.state;
    return renderHTML;
  }
}

Twitter.propTypes = {
  id: PropTypes.string
}

export default Twitter;
