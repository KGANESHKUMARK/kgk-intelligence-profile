import type { LearningVisual } from '../../types';

export const angularVisuals: LearningVisual[] = [
  {
    id: 'ang-cd-strategies',
    topicId: 'ang-component-architecture',
    type: 'comparison',
    title: 'Change Detection Strategies',
    description: 'How Angular decides when to update the DOM.',
    memoryTip: 'OnPush everywhere: skip unchanged subtrees. Signals: no Zone.js, only affected template expression updates.',
    columns: [
      {
        label: 'Default (Zone.js)',
        nodes: [
          { id: 'd1', label: 'Checks every component', caption: 'Top-down tree walk after every async event' },
          { id: 'd2', label: 'O(N) per event', caption: 'Expensive for large component trees' },
          { id: 'd3', label: 'No immutability required', caption: 'Simple, but performance degrades at scale' },
        ],
      },
      {
        label: 'OnPush',
        nodes: [
          { id: 'op1', label: 'Skips unchanged subtrees', caption: 'Checks only if @Input ref changes' },
          { id: 'op2', label: 'async pipe triggers update', caption: 'Or event fires within the component' },
          { id: 'op3', label: 'Requires immutable data', caption: 'New object reference, not mutation' },
        ],
      },
      {
        label: 'Signals (Angular 17+)',
        nodes: [
          { id: 's1', label: 'No Zone.js required', caption: 'provideExperimentalZonelessChangeDetection()' },
          { id: 's2', label: 'Fine-grained reactivity', caption: 'Only the expressions reading a signal re-evaluate' },
          { id: 's3', label: 'No subscription lifecycle', caption: 'signal() / computed() — auto-tracked' },
        ],
      },
    ],
  },
  {
    id: 'ang-rxjs-operators',
    topicId: 'ang-rxjs-patterns',
    type: 'comparison',
    title: 'Higher-Order Mapping Operators — When to Use',
    description: 'The four operators for handling Observable of Observables in Angular.',
    memoryTip: 'switchMap = cancel previous (search). exhaustMap = ignore new (login). concatMap = queue ordered. mergeMap = parallel.',
    columns: [
      {
        label: 'Cancel / Ignore',
        nodes: [
          { id: 'sw', label: 'switchMap', caption: 'Cancel previous inner. Use: type-ahead search.' },
          { id: 'ex', label: 'exhaustMap', caption: 'Ignore new while running. Use: login / submit button.' },
        ],
      },
      {
        label: 'Queue / Parallel',
        nodes: [
          { id: 'co', label: 'concatMap', caption: 'Queue: process in order. Use: sequential file uploads.' },
          { id: 'me', label: 'mergeMap', caption: 'All concurrent. Use: parallel pre-fetching.' },
        ],
      },
    ],
  },
  {
    id: 'ang-state-spectrum',
    topicId: 'ang-state-management',
    type: 'comparison',
    title: 'Angular State Management Options',
    description: 'Choose state management complexity proportional to team size and feature count.',
    memoryTip: 'Start simple. Only reach for NgRx when you need time-travel debugging, structured effects, and cross-team contracts.',
    columns: [
      {
        label: 'Simple → Complex',
        nodes: [
          { id: 'local', label: 'Component local state', caption: 'Private fields / signal(). UI toggles, form state.' },
          { id: 'service', label: 'Service + Signals', caption: 'Injectable service with signal(). Small–medium apps, single team.' },
          { id: 'ngrx-signal', label: 'NgRx Signal Store', caption: 'signalStore(). NgRx structure, signal reactivity, low boilerplate.' },
          { id: 'ngrx', label: 'NgRx (full Redux)', caption: 'Store + Actions + Reducers + Effects. Large multi-team apps.', topicId: 'ang-state-management' },
        ],
      },
      {
        label: 'Decision criteria',
        nodes: [
          { id: 'c1', label: '< 5 devs, < 10 features', caption: 'Service + signals is sufficient' },
          { id: 'c2', label: 'Complex async, cross-feature', caption: 'NgRx Effects + Selectors justified' },
          { id: 'c3', label: 'Time-travel debugging needed', caption: 'Redux DevTools → NgRx' },
          { id: 'c4', label: 'UI-only state (modal open)', caption: 'Keep in component — never put in NgRx' },
        ],
      },
    ],
  },
];
