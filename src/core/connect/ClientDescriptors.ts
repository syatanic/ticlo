import {FunctionDesc} from '../block/Descriptor';

export const clientDescriptors: FunctionDesc[] = [
  {
    priority: 0,
    name: 'inputs',
    id: 'flow:inputs',
    icon: 'fas:arrow-circle-down',
    color: 'e91',
    properties: [],
    configs: ['#value'],
  },
  {
    priority: 0,
    name: 'outputs',
    id: 'flow:outputs',
    icon: 'fas:arrow-circle-up',
    color: 'e91',
    properties: [],
    configs: ['#value', '#wait(#outputs)'],
  },
  {
    priority: 0,
    name: 'main',
    id: 'flow:main',
    properties: [],
    icon: 'fas:file',
    color: 'e91',
    src: 'hidden',
    ns: 'flow',
    configs: ['#disabled'],
  },
  {
    priority: 0,
    name: 'const',
    id: 'flow:const',
    properties: [],
    icon: 'fas:file',
    color: 'e91',
    src: 'hidden',
    ns: 'flow',
    configs: [],
  },
  {
    priority: 0,
    name: 'worker',
    id: 'flow:worker',
    properties: [],
    icon: 'fas:file',
    color: 'e91',
    src: 'hidden',
    ns: 'flow',
    configs: ['#desc', '#disabled'],
  },
  {
    priority: 0,
    name: 'editor',
    id: 'flow:editor',
    properties: [],
    icon: 'fas:file',
    color: 'e91',
    src: 'hidden',
    ns: 'flow',
    configs: ['#desc', '#disabled'],
  },
  {
    priority: 0,
    name: 'shared',
    id: 'flow:shared',
    properties: [],
    icon: 'fas:file',
    color: 'e91',
    src: 'hidden',
    ns: 'flow',
    configs: ['#cacheMode', '#disabled'],
  },
];
