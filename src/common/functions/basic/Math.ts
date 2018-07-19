import {Classes} from "../../block/Class";
import {BaseFunction, FunctionData} from "../../block/BlockFunction";
import {FunctionDesc} from "../../block/Descriptor";

const descriptorN: FunctionDesc = {
  useLength: true,
  inputs: [
    {group: '', type: 'number'}
  ],
  outputs: [
    {name: 'output', type: 'number'}
  ],
};
const descriptor2: FunctionDesc = {
  inputs: [
    {name: '0', type: 'number'},
    {name: '1', type: 'number'}
  ],
  outputs: [
    {name: 'output', type: 'number'}
  ],
};


export class AddFunction extends BaseFunction {
  run(): any {
    let len = this._data.getLength();
    if (!(len >= 0)) {
      len = 2;
    }
    if (len > 0) {
      let sum = 0;
      for (let i = 0; i < len; ++i) {
        let val = this._data.getValue(String(i));
        if (val == null) {
          this._data.output(undefined);
          return;
        }
        sum += Number(val);
      }
      this._data.output(sum);
    } else {
      this._data.output(undefined);
    }
  }
}

AddFunction.prototype.priority = 0;
AddFunction.prototype.descriptor = descriptorN;
Classes.add('add', AddFunction);


export class MultiplyFunction extends BaseFunction {
  run(): any {
    let len = this._data.getLength();
    if (!(len >= 0)) {
      len = 2;
    }
    if (len > 0) {
      let product = 1;
      for (let i = 0; i < len; ++i) {
        let val = this._data.getValue(String(i));
        if (val == null) {
          this._data.output(undefined);
          return;
        }
        product *= Number(val);
      }
      this._data.output(product);
    } else {
      this._data.output(undefined);
    }
  }
}

MultiplyFunction.prototype.priority = 0;
MultiplyFunction.prototype.descriptor = descriptorN;
Classes.add('multiply', MultiplyFunction);


export class SubtractFunction extends BaseFunction {
  run(): any {
    let v0 = this._data.getValue('0');
    let v1 = this._data.getValue('1');
    if (v0 == null || v1 == null) {
      this._data.output(undefined);
    } else {
      this._data.output(Number(v0) - Number(v1));
    }
  }
}

SubtractFunction.prototype.priority = 0;
SubtractFunction.prototype.descriptor = descriptor2;
Classes.add('subtract', SubtractFunction);


export class DivideFunction extends BaseFunction {
  run(): any {
    let v0 = this._data.getValue('0');
    let v1 = this._data.getValue('1');
    if (v0 == null || v1 == null) {
      this._data.output(undefined);
    } else {
      this._data.output(Number(v0) / Number(v1));
    }
  }
}

DivideFunction.prototype.priority = 0;
DivideFunction.prototype.descriptor = descriptor2;
Classes.add('divide', DivideFunction);
