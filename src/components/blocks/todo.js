import PropTypes from 'prop-types';
// import './todo.scss';

import React from 'react';
import { EditorBlock } from 'draft-js';

import { updateDataOfBlock } from '../../model/';

export default class TodoBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    blockProps: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.updateData = this.updateData.bind(this);
  }
  _updateData() {
    const { block, blockProps } = this.props;
    const { setEditorState, getEditorState } = blockProps;
    const data = block.getData();
    const checked = (data.has('checked') && data.get('checked') === true);
    const newData = data.set('checked', !checked);
    setEditorState(updateDataOfBlock(getEditorState(), block, newData));
  }
  render() {
    const data = this.props.block.getData();
    const checked = data.get('checked') === true;
    return (
      <div className={checked ? 'block-todo-completed' : ''}>
        <input type="checkbox" checked={checked} onChange={this.updateData} />
        <EditorBlock {...this.props} />
      </div>
    );
  }
}