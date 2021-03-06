import {assert} from 'chai';
import {TestFunctionRunner} from './TestFunction';
import {Flow, Root} from '../Flow';

describe('BlockPriority', function () {
  beforeEach(() => {
    TestFunctionRunner.clearLog();
  });

  afterEach(() => {
    TestFunctionRunner.clearLog();
  });

  it('basic function order', function () {
    let flow = new Flow();

    let p0 = flow.createBlock('p0');
    let p1 = flow.createBlock('p1');
    let p2 = flow.createBlock('p2');
    let p3 = flow.createBlock('p3');

    p0.setValue('#-log', 'p0');
    p1.setValue('#-log', 'p1');
    p2.setValue('#-log', 'p2');
    p3.setValue('#-log', 'p3');

    p3.setValue('#is', 'test-runner');
    p0.setValue('#is', 'test-runner');
    p1.setValue('#is', 'test-runner');
    p2.setValue('#is', 'test-runner');
    Root.run();

    assert.deepEqual(
      TestFunctionRunner.popLogs(),
      ['p3', 'p0', 'p1', 'p2'],
      'function should run in the same order as type is set'
    );

    assert.deepEqual(TestFunctionRunner.popLogs(), [], 'logs should be cleared');

    p3.updateValue('#call', {});
    p1.updateValue('#call', {});
    p2.updateValue('#call', {});
    p0.updateValue('#call', {});
    Root.run();

    assert.deepEqual(
      TestFunctionRunner.popLogs(),
      ['p3', 'p1', 'p2', 'p0'],
      'function should run in the same order as they are called'
    );

    p1.setValue('#priority', 1);
    p3.setValue('#priority', 3);
    p0.setValue('#priority', 0);
    p2.setValue('#priority', 2);

    p3.updateValue('#call', {});
    p1.updateValue('#call', {});
    p2.updateValue('#call', {});
    p0.updateValue('#call', {});
    Root.run();

    assert.deepEqual(
      TestFunctionRunner.popLogs(),
      ['p0', 'p1', 'p2', 'p3'],
      'function should run in the same order as their priority'
    );
  });

  it('order from binding', function () {
    let flow = new Flow();

    let p2 = flow.createBlock('p2');
    let p0 = flow.createBlock('p0');
    let p1 = flow.createBlock('p1');
    let p3 = flow.createBlock('p3');

    p3.setValue('#mode', 'onChange');
    p0.setValue('#mode', 'onChange');
    p2.setValue('#mode', 'onChange');
    p1.setValue('#mode', 'onChange');

    p3.setValue('#-log', 'p3');
    p0.setValue('#-log', 'p0');
    p2.setValue('#-log', 'p2');
    p1.setValue('#-log', 'p1');

    p1.setBinding('input', '##.p0.input');
    p2.setBinding('input', '##.p1.input');
    p3.setBinding('input', '##.p2.input');

    p3.setValue('#is', 'test-runner');
    p0.setValue('#is', 'test-runner');
    p1.setValue('#is', 'test-runner');
    p2.setValue('#is', 'test-runner');
    Root.run();

    p0.updateValue('input', {});
    Root.run();
    assert.deepEqual(
      TestFunctionRunner.popLogs(),
      ['p0', 'p1', 'p2', 'p3'],
      'function should run in the same order as binding chain'
    );
  });

  it('priority change during resolving', function () {
    let flow = new Flow();

    let p0 = flow.createBlock('p0');
    let p1 = flow.createBlock('p1');
    let p2 = flow.createBlock('p2');

    p0.setValue('#-log', 'p0');
    p1.setValue('#-log', 'p1');
    p2.setValue('#-log', 'p2');

    p0.setValue('#mode', 'onChange');
    p1.setValue('#mode', 'onChange');
    p2.setValue('#mode', 'onChange');

    p0.setBinding('#call', '##.p2.#call');
    p2.setBinding('#call', '##.p1.#emit');

    p0.setValue('#is', 'test-runner');
    p1.setValue('#is', 'test-runner');
    p2.setValue('#is', 'test-runner');

    p0.setValue('#priority', 0);
    p1.setValue('#priority', 1);
    p2.setValue('#priority', 2);

    p1.setValue('#call', {});
    Root.run();
    assert.deepEqual(
      TestFunctionRunner.popLogs(),
      ['p1', 'p0', 'p2'],
      'next priority to run in resolver changes during iteration'
    );
  });
});
