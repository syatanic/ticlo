import {BaseFunction, Functions, PropDesc, PropGroupDesc} from '../../../src/core';
import StyleDef from './StyleDef';

export class CreateStyleFunction extends BaseFunction {
  run() {
    let spread = this._data.getValue('#spread');
    let output = spread ? {...spread} : {};
    let custom: PropDesc | PropGroupDesc[] = this._data.getValue('#custom');
    if (Array.isArray(custom)) {
      for (let prop of custom) {
        if (prop) {
          if (prop.type === 'group') {
            let length = this._data.getValue(`${prop.name}#len`);
            if (!(length >= 0)) {
              length = prop.defaultLen;
            }
            for (let groupProp of prop.properties) {
              let arr: any[] = [];
              for (let i = 0; i < length; ++i) {
                arr.push(this._data.getValue(`${groupProp.name}${i}`));
              }
              output[groupProp.name] = arr;
            }
          } else {
            let val = this._data.getValue(prop.name);
            if (val !== undefined) {
              output[prop.name] = this._data.getValue(prop.name);
            }
          }
        }
      }
    }
    this._data.output(output);
  }
}

Functions.add(
  CreateStyleFunction,
  {
    name: 'create-style',
    icon: 'fab:css3',
    base: 'html:create-style',
    optional: StyleDef,
    properties: [
      {name: '#spread', type: 'object'},
      {name: 'output', type: 'object', readonly: true}
    ]
  },
  'html'
);