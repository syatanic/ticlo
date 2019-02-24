import React from 'react';
import {DataRendererItem, PureDataRenderer} from "./DataRenderer";

export type ExpandState = 'opened' | 'closed' | 'loading' | 'empty' | 'disabled';

interface Props {
  opened: ExpandState;
  onClick: React.MouseEventHandler<HTMLElement>;
}

export function ExpandIcon(props: Props) {
  switch (props.opened) {
    case 'opened':
      return (
        <div
          onClick={props.onClick}
          className="ticl-tree-arr ticl-tree-arr-expand"
          style={{transform: 'rotate(90deg)'}}
        />
      );
    case 'closed':
      return (
        <div
          onClick={props.onClick}
          className="ticl-tree-arr ticl-tree-arr-expand"
        />
      );
    case 'loading':
      return (
        <div
          className="ticl-tree-arr ticl-tree-arr-loading"
        />
      );
    case 'empty':
      return (
        <div
          onClick={props.onClick}
          className="ticl-tree-arr ticl-tree-arr-empty"
        />
      );
    default:
      return (
        <div
          className="ticl-tree-arr"
        />
      );
  }
}

export abstract class TreeItem extends DataRendererItem {
  opened: ExpandState = 'closed';

  children: TreeItem[] = null;

  addToList(list: TreeItem[]) {
    list.push(this);
    if (this.opened === 'opened' && this.children) {
      for (let child of this.children) {
        child.addToList(list);
      }
    }
  }

  destroyChildren() {
    if (this.children) {
      for (let child of this.children) {
        child.destroy();
      }
      this.children = null;
    }
  }

  destroy() {
    this.destroyChildren();
  }
}
