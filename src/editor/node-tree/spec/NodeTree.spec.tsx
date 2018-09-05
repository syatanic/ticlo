import {assert} from "chai";
import * as React from 'react';
import NodeTree from "../NodeTree";
import * as ReactUtils from 'react-dom/test-utils';
import {Block, Root} from "../../../common/block/Block";
import {makeLocalConnection} from "../../../common/connect/LocalConnection";
import {shouldHappen} from "../../../common/util/test-util";
import * as ReactDOM from "react-dom";
import {loadTemplate} from "../../../ui/util/test-util";

describe("NodeTree", () => {

  let job = Root.instance.addJob('NodeTree');

  function addTestChildren(block: Block, level: number) {
    for (let i = 0; i < Math.random() * 20; ++i) {
      let child = block.createBlock(Math.random().toString(36).substr(-4));
      if (level > 0) {
        addTestChildren(child, level - 1);
      }
    }
  }

  addTestChildren(job, 3);

  let [server, client] = makeLocalConnection(Root.instance);

  it('basic', async () => {
    let [component, div] = loadTemplate(
      <NodeTree
        conn={client}
        basePath="example"
        style={{width: '600px', height: '600px'}}
      />);
    await shouldHappen(() => div.hasChildNodes());
    ReactDOM.unmountComponentAtNode(div);
  });

});
