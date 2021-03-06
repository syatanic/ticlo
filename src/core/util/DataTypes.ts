import {isMoment} from 'moment';
import QS from 'qs';
import {Block} from '../block/Block';
import {BlockIO} from '../block/BlockProperty';
import {decode, encodeRaw} from './Serialize';

export interface DataMap {
  [key: string]: any;
}

export const TRUNCATED = '·∙·'; // '\u00b7\u2219\u00b7'

export function isPrimitiveType(val: any) {
  if (val == null) {
    return true;
  }
  switch (typeof val) {
    case 'number':
    case 'string':
    case 'boolean':
      // case 'bigint':
      return true;
    default:
      return false;
  }
}

export function isSavedBlock(val: any): boolean {
  return Object.isExtensible(val) && (val.hasOwnProperty('#is') || val.hasOwnProperty('~#is'));
}

function truncateMap(val: DataMap, maxSize: number): [any, number, boolean] {
  let total = 0;
  let truncated = false;
  let result: DataMap = {};
  let count = 0;
  for (let key in val) {
    ++count;
    if (total >= maxSize || count > 9) {
      if (count < 5) {
        result[key] = TRUNCATED;
        continue;
      }
      result[TRUNCATED] = 1;
      return [result, total, true];
    }
    let [t, size, trunc] = truncateObj(val[key], (maxSize - total) * 0.75);
    result[key] = t;
    total += size + key.length;
    if (trunc) {
      truncated = true;
    }
  }
  return [result, total, truncated];
}

function truncateArray(val: any[], maxSize: number): [any[], number, boolean] {
  let total = 0;
  let truncated = false;
  let result: any[] = [];

  for (let i = 0; i < val.length; ++i) {
    if (total >= maxSize || i > 8) {
      result.push(TRUNCATED);
      return [result, total, true];
    }
    let [t, size, trunc] = truncateObj(val[i], (maxSize - total) * 0.75);
    total += size;
    result.push(t);
    if (trunc) {
      truncated = true;
    }
  }
  return [result, total, truncated];
}

// if object is big, truncated it into around 1K~2K characters
function truncateObj(val: any, maxSize: number = 1024): [any, number, boolean] {
  if (typeof val === 'object') {
    if (val == null) {
      return [val, 4, false];
    }
    if (Array.isArray(val)) {
      return truncateArray(val, maxSize);
    }
    if (isMoment(val)) {
      return [val, 33, false];
    }
    if (val.constructor === Object) {
      return truncateMap(val, maxSize);
    }
    let encoded = encodeRaw(val);
    if (typeof encoded === 'string' && encoded.length < 100) {
      return [encoded, encoded.length, false];
    }
    // TODO binary ?
    return [TRUNCATED, 4, true];
  } else if (typeof val === 'string') {
    if (val.length > maxSize / 2) {
      if (maxSize > 256) {
        return [`${val.substr(0, 128)}${TRUNCATED}`, 128, true];
      } else {
        return [`${val.substr(0, 8)}${TRUNCATED}`, 8, true];
      }
    }
    return [val, val.length, false];
  } else {
    return [val, 4, false];
  }
}

export function truncateData(val: any, maxSize: number = 1024): [any, number] {
  let [result, total, truncated] = truncateObj(val, maxSize);
  if (truncated) {
    if (Array.isArray(result)) {
      if (result[result.length - 1] !== TRUNCATED) {
        result.push(TRUNCATED);
      }
    } else if (result.constructor === Object) {
      if (!result[TRUNCATED]) {
        result[TRUNCATED] = 1;
      }
    }
  }
  return [result, total];
}

export function isDataTruncated(val: any): boolean {
  if (val == null) {
    return false;
  }
  if (typeof val === 'string') {
    return val.endsWith(TRUNCATED);
  }
  if (Array.isArray(val)) {
    return val.length > 0 && val[val.length - 1] === TRUNCATED;
  }
  if (val.constructor === Object) {
    return Boolean(val[TRUNCATED]);
  }
  return false;
}

function measureMap(val: DataMap, maxSize: number): number {
  let total = 0;
  for (let key in val) {
    total += measureObjSize(val[key], maxSize);
    total += key.length;
    if (total >= maxSize) {
      return total;
    }
  }
  return total;
}

function measureArray(arr: any[], maxSize: number): number {
  let total = 0;
  for (let v of arr) {
    total += measureObjSize(v);
    if (total >= maxSize) {
      return total;
    }
  }
  return total;
}

// if object is big, measured it into around 1K~2K characters
export function measureObjSize(val: any, maxSize: number = 1024): number {
  if (typeof val === 'object') {
    if (val == null) {
      return 4;
    }
    if (Array.isArray(val)) {
      return measureArray(val, maxSize);
    }
    if (val.constructor === Object) {
      return measureMap(val, maxSize);
    }
    // TODO moment and binary
  } else if (typeof val === 'string') {
    return val.length;
  }
  return 4;
}

// convert block to Object, used to convert worker #outputs block
export function convertToOutput(val: any, recursive: boolean = false): any {
  if (val instanceof Block) {
    let overrideValue = val.getValue('#value');
    if (overrideValue !== undefined) {
      return overrideValue;
    }
    let result: any = {};
    val.forEach((field: string, prop: BlockIO) => {
      if (recursive && prop._value instanceof Block) {
        if (prop._saved === prop._value) {
          result[field] = convertToOutput(prop._value, true);
        } else {
          result[field] = null;
        }
      } else {
        result[field] = prop._value;
      }
    });
    return result;
  }
  return val;
}

// convert input to output object
export function convertToObject(val: any): {[key: string]: any} {
  switch (typeof val) {
    case 'object':
      if (val) {
        return val;
      }
      break;
    case 'string':
      try {
        if (val.startsWith('{')) {
          return decode(val);
        } else {
          return QS.parse(val);
        }
      } catch (e) {}
  }
  return {};
}
