import {assert} from 'chai';
import '../Compare';
import {Block} from '../../../block/Block';
import {Flow, Root} from '../../../block/Flow';

describe('Compare', function () {
  it('equal', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'equal',
      '0': 'a',
      '1': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('0', NaN);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', NaN);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('0', undefined);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', null);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', undefined);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);
  });

  it('not', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'not',
      'input': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('input', null);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);
  });

  it('not equal', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'not-equal',
      '0': 'a',
      '1': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('0', NaN);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('1', NaN);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('0', undefined);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('1', null);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('1', undefined);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);
  });

  it('greater than', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'greater-than',
      '0': 'b',
      '1': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('0', 2);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', 1);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);
  });

  it('greater equal', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'greater-equal',
      '0': 'b',
      '1': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), true);

    aBlock.setValue('0', 2);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', 2);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);
  });

  it('less than', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'less-than',
      '0': 'b',
      '1': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('0', 2);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', 3);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);
  });

  it('less equal', function () {
    let flow = new Flow();

    let aBlock = flow.createBlock('a');
    aBlock._load({
      '#is': 'less-equal',
      '0': 'b',
      '1': 'a',
    });

    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('0', 2);
    Root.run();
    assert.equal(aBlock.getValue('#output'), false);

    aBlock.setValue('1', 2);
    Root.run();
    assert.equal(aBlock.getValue('#output'), true);
  });
});
