import React, {ChangeEvent} from 'react';
import {ClientConn, decode} from '../../../../src/core/editor';
import {TicloLayoutContext, TicloLayoutContextType} from '../../component/LayoutContext';
import {NodeTree} from '../..';
import {Button, Input, Modal, Tooltip} from 'antd';
import FileAddIcon from '@ant-design/icons/FileAddOutlined';
import ReloadIcon from '@ant-design/icons/ReloadOutlined';
import {AddNewJob} from './AddNewJob';
import {DragDropDiv, DragState} from 'rc-dock/lib';
const {TextArea} = Input;

interface Props {
  conn: ClientConn;
  basePaths: string[];
  hideRoot?: boolean;
  onSelect?: (keys: string[]) => void;
  showMenu?: boolean;
}

interface State {
  jobModelVisible: boolean;
  jobBasePath?: string;
  selectedKeys: string[];
}

export class NodeTreePane extends React.PureComponent<Props, State> {
  static contextType = TicloLayoutContextType;
  context!: TicloLayoutContext;

  state: State = {selectedKeys: [], jobModelVisible: false};

  _nodeTree: NodeTree;
  getNodeTree = (ref: NodeTree) => {
    this._nodeTree = ref;
  };

  onChange(selectedKeys: string[]) {
    this.setState({selectedKeys});
  }

  onSourceChange(source: any): void {}

  componentDidMount(): void {
    this.context?.selectedPaths.listen(this);
  }
  componentWillUnmount(): void {
    this.context?.selectedPaths.unlisten(this);
  }

  reload = () => {
    this._nodeTree?.reload();
  };

  showNewJobModel = () => {
    this.setState({jobModelVisible: true, jobBasePath: null});
  };
  hideNewJobModel = () => {
    this.setState({jobModelVisible: false});
  };

  newJobDragOver = (e: DragState) => {
    let {conn} = this.props;
    let path = DragState.getData('path', conn.getBaseConn());
    if (path) {
      e.accept('tico-fas-plus-square');
    }
  };
  newJobDrop = (e: DragState) => {
    let {conn} = this.props;
    let path = DragState.getData('path', conn.getBaseConn());
    if (path) {
      this.setState({jobBasePath: `${path}.`, jobModelVisible: true});
    }
  };
  render() {
    let {conn, basePaths, hideRoot, onSelect, showMenu} = this.props;
    let {selectedKeys, jobModelVisible, jobBasePath} = this.state;

    return (
      <div className="ticl-node-tree-pane">
        {showMenu ? (
          <div className="tlcl-top-menu-box ticl-hbox">
            <Tooltip title="Reload">
              <Button size="small" icon={<ReloadIcon />} onClick={this.reload} />
            </Tooltip>
            <Tooltip title="New Job">
              <DragDropDiv onDragOverT={this.newJobDragOver} onDropT={this.newJobDrop}>
                <Button size="small" icon={<FileAddIcon />} onClick={this.showNewJobModel} />
              </DragDropDiv>
            </Tooltip>
            <AddNewJob conn={conn} onClose={this.hideNewJobModel} visible={jobModelVisible} basePath={jobBasePath} />
          </div>
        ) : null}
        <NodeTree
          ref={this.getNodeTree}
          conn={conn}
          basePaths={basePaths}
          hideRoot={hideRoot}
          selectedKeys={selectedKeys || []}
          onSelect={onSelect}
        />
      </div>
    );
  }
}
