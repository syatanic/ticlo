import {Block, InputsBlock, Runnable} from './Block';
import {BlockConfig, BlockIO, BlockProperty, GlobalProperty} from './BlockProperty';
import {Resolver} from './Resolver';
import {FunctionOutput} from './BlockFunction';
import {BlockConstConfig, ConstTypeConfig, JobConfigGenerators} from './BlockConfigs';
import {Event} from './Event';
import {DataMap} from '../util/DataTypes';
import {FunctionDesc} from './Descriptor';
import {Functions} from './Functions';
import {Storage} from './Storage';

export class Job extends Block {
  _resolver: Resolver;

  _namespace: string;
  _loadFrom: string;

  _enabled: boolean = true;
  _loading: boolean = false;

  _outputObj?: FunctionOutput;

  constructor(parent: Block = Root.instance, output?: FunctionOutput, property?: BlockProperty) {
    super(null, null, property);
    this._job = this;
    this._parent = parent;
    this._outputObj = output;
    if (!property) {
      this._prop = new BlockProperty(this, '');
    }

    if (parent) {
      let parentJob = parent._job;
      this._resolver = new Resolver((resolver: Resolver) => {
        parentJob.queueBlock(this._resolver);
      });
    }
  }

  onWait(val: any) {
    let wait = Boolean(val);
    if (!wait && wait !== this._waiting) {
      this._resolver.schedule();
    }
    super.onWait(wait);
  }

  _createConfig(field: string): BlockProperty {
    if (field in JobConfigGenerators) {
      return new JobConfigGenerators[field](this, field);
    } else {
      return new BlockConfig(this, field);
    }
  }

  createGlobalProperty(name: string): BlockProperty {
    let prop = new GlobalProperty(this, name);
    this._props.set(name, prop);
    return prop;
  }

  getGlobalProperty(name: string): BlockProperty {
    return this.getProperty(name);
  }

  queueBlock(block: Runnable) {
    this._resolver.queueBlock(block);
  }

  // return true when the related output block need to be put in queue
  outputChanged(input: BlockIO, val: any): boolean {
    if (this._outputObj) {
      this._outputObj.output(val, input._name);
    }
    return false;
  }

  // make sure the input triggers a change
  updateInput(val: any) {
    let prop = this.getProperty('#inputs');
    if (prop._value instanceof InputsBlock) {
      prop._value._setInputValue(val);
    } else {
      prop.updateValue(val);
    }
    this._resolver.schedule();
  }

  cancel() {
    this.getProperty('#cancel').updateValue(new Event('cancel'));
  }

  _save(): DataMap {
    // job shouldn't be saved within parent Block
    return undefined;
  }

  save(): DataMap {
    return super._save();
  }

  _applyChange: (data: DataMap) => boolean;
  _onDestory: () => void;

  load(src: DataMap, funcId?: string, applyChange?: (data: DataMap) => boolean, onDestory?: () => void): boolean {
    this._loading = true;
    let loaded = false;
    if (funcId) {
      // load from worker class
      let desc: FunctionDesc = Functions.getDescToSend(funcId)[0];
      if (desc) {
        let data = Functions.getWorkerData(funcId);
        if (data) {
          this._namespace = desc.ns;
          this._loadFrom = funcId;
          this._loadJobData(data, funcId);
          loaded = true;
        }
      } else if (src) {
        let colonIndex = funcId.indexOf(':');
        if (colonIndex >= 0) {
          this._namespace = funcId.substring(0, colonIndex);
        } else {
          this._namespace = null;
        }
        this._loadFrom = funcId;
        this._loadJobData(src, funcId);
        loaded = true;
      }
    } else {
      this._namespace = this._parent._job._namespace;
      this._loadFrom = null;
      if (src) {
        this._loadJobData(src);
        loaded = true;
      }
    }
    if (loaded) {
      this._applyChange = applyChange;
      this._onDestory = onDestory;
    }
    this._loading = false;
    return loaded;
  }
  _loadJobData(map: DataMap, funcId?: string) {
    super._load(map);
  }

  trackChange() {
    if (this._applyChange) {
      this.updateValue('@has-change', true);
    }
  }

  applyChange() {
    if (this._applyChange) {
      let saved = this._applyChange(this.save());
      this.deleteValue('@has-change');
      return saved;
    }
    return false;
  }

  liveUpdate(map: DataMap) {
    this._loading = true;
    this._liveUpdate(map);
    this._loading = false;
  }

  set onResolved(func: () => void) {
    this._resolver.onResolved = func;
  }

  destroy(): void {
    this._onDestory?.();
    super.destroy();
  }
}

export const JobConstConfigGenerators: {[key: string]: typeof BlockProperty} = {
  ...JobConfigGenerators,
  '#is': ConstTypeConfig('job:const')
};

class ConstBlock extends Job {
  _createConfig(field: string): BlockProperty {
    if (field in JobConstConfigGenerators) {
      return new JobConstConfigGenerators[field](this, field);
    } else {
      return new BlockConfig(this, field);
    }
  }
}

class GlobalBlock extends ConstBlock {
  createGlobalProperty(name: string): BlockProperty {
    // inside the GlobalBlock, globalProperty is normal property
    let prop = new BlockIO(this, name);
    this._props.set(name, prop);
    return prop;
  }
}

class JobMain extends Job {
  _save(): DataMap {
    return this.getValue('@b-xyw');
  }
}

export class Root extends Job {
  private static _instance: Root = new Root();
  static get instance() {
    return this._instance;
  }

  static run() {
    this._instance._run();
  }

  /**
   * resolve recursively
   */

  static runAll(maxRound = 10) {
    this._instance.runAll(maxRound);
  }

  _storage: Storage;

  async setStorage(storage: Storage) {
    Functions.setStorage(storage);
    await storage.init(this);
    this._storage = storage;
  }

  _run = () => {
    this._resolver.run();
    this._resolver._queued = false;
    Event._uid.next();
    Resolver._executeFinalResolved();
  };

  runAll(maxRound = 10) {
    for (let i = 0; i < maxRound; ++i) {
      if (this._resolver._queued) {
        this._run();
      } else {
        break;
      }
    }
  }

  _globalRoot: Job;
  _sharedRoot: Job;
  _tempRoot: Job;

  constructor() {
    super();
    this._parent = this;
    this._resolver = new Resolver((resolver: Resolver) => {
      resolver._queued = true;
      resolver._queueToRun = true;
      setTimeout(this._run, 0);
    });

    // create the readolny global block
    this._globalRoot = this._createConstBlock('#global', (prop) => new GlobalBlock(this, this, prop))._value;
    this._tempRoot = this._createConstBlock('#temp', (prop) => new ConstBlock(this, this._globalRoot, prop))._value;
    this._sharedRoot = this._createConstBlock('#shared', (prop) => new ConstBlock(this, this._globalRoot, prop))._value;

    this._props.set('', new BlockConstConfig(this, '', this));
  }

  createGlobalProperty(name: string): BlockProperty {
    return this.getGlobalProperty(name);
  }

  getGlobalProperty(name: string): BlockProperty {
    return this._globalRoot.getProperty(name);
  }

  addJob(path?: string, data?: DataMap): Job {
    if (!path) {
      path = Block.nextUid();
    }
    let prop = this.queryProperty(path, true);
    if (!prop || prop._value instanceof Block) {
      // invalid path
      return null;
    }
    let newJob = new JobMain(prop._block, null, prop);
    let propValue = prop._value;
    if (Array.isArray(propValue) && propValue.length === 3 && propValue.every((val) => typeof val === 'number')) {
      // overwrite @b-xyw value from parent job
      data = {...data, '@b-xyw': propValue};
    }
    if (this._storage) {
      if (!data) {
        data = {};
      }
      let loader = this._storage;
      newJob.load(
        data,
        null,
        (saveData) => {
          loader.saveJob(path, newJob, saveData);
          return true;
        },
        () => {
          loader.deleteJob(path);
        }
      );
      this._storage.saveJob(path, newJob, data);
    } else {
      if (data) {
        newJob.load(data);
      }
    }
    prop.setValue(newJob);
    return newJob;
  }

  deleteJob(name: string) {
    let prop = this.getProperty(name, false);
    if (prop?._value instanceof Job) {
      if (this._storage) {
        this._storage.deleteJob(name);
      }
      prop.setValue(undefined);
    }
  }

  save(): DataMap {
    // not allowed
    return null;
  }

  load(map: DataMap, funcId?: string, applyChange?: (data: DataMap) => boolean) {
    // not allowed
    return false;
  }

  liveUpdate(map: DataMap) {
    // not allowed
  }
}