import type { InterviewQuestion } from '../../types';

const T = 'angular';

export const angularQuestions: InterviewQuestion[] = [
  {
    id: 'q-ang-change-detection',
    technology: T,
    question: 'How does Angular change detection work and how do you optimise it?',
    category: 'Core Architecture',
    difficulty: 'advanced',
    tags: ['change detection', 'OnPush', 'Zone.js', 'signals', 'performance'],
    quickAnswer: 'Zone.js patches async APIs and triggers CD after every event; by default every component is checked. OnPush limits checks to changed @Input references or async pipe emissions. Signals replace Zone.js with fine-grained reactivity.',
    interviewAnswer: `Zone.js (the default) monkey-patches async APIs (setTimeout, Promises, XHR, event listeners) and calls ApplicationRef.tick() after each async operation — triggering a top-down walk of the entire component tree.

Default change detection: every component is checked for template expression changes in order. On a large tree with many components, this is expensive.

ChangeDetectionStrategy.OnPush: Angular skips a component and all its descendants unless:
1. An @Input() property receives a new object reference.
2. An event emits from within the component or children.
3. An Observable/signal bound with async pipe emits.
4. markForCheck() or detectChanges() is called explicitly.

With OnPush + immutable data: a component receiving an object only re-checks when the reference changes. Passing the same mutated object does NOT trigger a check (the reference is the same).

Angular 17+ Signals: provideExperimentalZonelessChangeDetection() enables running without Zone.js. signal() creates a reactive primitive; computed() derives values; effect() reacts to changes. Only template expressions that read a signal are re-evaluated when it changes — true fine-grained reactivity.`,
    codeExample: `// WRONG: mutation does not trigger OnPush re-check
this.account.balance = 500;       // same reference, OnPush skips

// CORRECT: new reference triggers OnPush
this.account = { ...this.account, balance: 500 };

// Signals — no Zone.js or explicit immutability needed
const balance = signal(1000);
const display = computed(() => \`SGD \${balance()}\`);
balance.set(1500);   // only the bindings reading 'display' update`,
    codeLanguage: 'TypeScript',
    followUpQuestions: [
      { question: 'What is the difference between markForCheck() and detectChanges()?', hint: 'markForCheck() marks the component and ancestors for the next CD cycle; detectChanges() runs CD synchronously on the component and its view.' },
      { question: 'How do Angular Signals interact with the Zone.js-based change detection?', hint: 'Signals trigger markForCheck() on any component that reads them, working with or without Zone.js.' },
    ],
    keyTerms: ['Zone.js', 'OnPush', 'markForCheck', 'signals', 'fine-grained reactivity', 'immutability'],
    commonMistakes: ['Mutating @Input objects with OnPush (no re-render)', 'Calling detectChanges() too frequently (synchronous, expensive)'],
    interviewerIntent: 'Core Angular senior interview question — tests deep understanding of the rendering model.',
    whatIsTested: ['Zone.js mechanics', 'OnPush strategy', 'Signals basics', 'Performance implications'],
    topicId: 'ang-component-architecture',
  },
  {
    id: 'q-ang-switchmap-vs-mergemap',
    technology: T,
    question: 'When do you use switchMap, mergeMap, concatMap, and exhaustMap in Angular? Give a real example of each.',
    category: 'Reactive Programming',
    difficulty: 'advanced',
    tags: ['RxJS', 'switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'Angular'],
    quickAnswer: 'switchMap: type-ahead (cancel previous). mergeMap: fire-and-forget parallel. concatMap: sequential queue. exhaustMap: login button (ignore during in-flight).',
    interviewAnswer: `These four operators all handle "Observable of Observables" but differ in how they manage overlapping inner observables.

switchMap: cancels the previous inner observable when a new outer emission arrives. Use for: type-ahead search (we only care about the latest query's results), route parameter changes (cancel previous API call).

mergeMap (flatMap): subscribes to all inner observables concurrently. Use for: fire-and-forget operations that are independent (logging events, pre-fetching data for multiple items).

concatMap: queues inner observables — waits for the previous to complete before starting the next. Use for: ordered operations (sequential file uploads, step-by-step form submissions where order matters).

exhaustMap: ignores new outer emissions while the current inner observable is in flight. Use for: login/submit buttons (ignore double-clicks and rapid retaps until the current request completes).`,
    codeExample: `// switchMap — search (cancel previous HTTP request)
this.searchCtrl.valueChanges.pipe(
  debounceTime(300),
  switchMap(term => this.api.search(term))  // cancels previous request on new term
).subscribe();

// exhaustMap — login button (ignore clicks while logging in)
this.loginBtn.events.pipe(
  exhaustMap(() => this.auth.login(this.form.value))  // ignores clicks until login resolves
).subscribe();

// concatMap — sequential saves (upload files in order)
from(files).pipe(
  concatMap(file => this.api.upload(file))  // waits for each upload before starting next
).subscribe();

// mergeMap — parallel pre-fetch (all concurrent)
of('id1', 'id2', 'id3').pipe(
  mergeMap(id => this.api.prefetch(id))  // all three fetches run in parallel
).subscribe();`,
    codeLanguage: 'TypeScript',
    followUpQuestions: [
      { question: 'What happens if you use mergeMap for a search typeahead?', hint: 'Results from an earlier query can arrive after a later one, showing stale results.' },
      { question: 'How do you handle errors inside switchMap without killing the outer Observable?', hint: 'catchError inside the switchMap projection: .pipe(catchError(() => of([]))).' },
    ],
    keyTerms: ['switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'inner observable', 'race condition'],
    commonMistakes: ['Using mergeMap for search (race condition)', 'Using concatMap for independent parallel requests (unnecessarily slow)'],
    interviewerIntent: 'A discriminating RxJS question for Angular developers — most can name the operators but struggle with real use cases.',
    whatIsTested: ['Higher-order mapping operator selection', 'Race condition awareness', 'Real use cases'],
    topicId: 'ang-rxjs-patterns',
  },
  {
    id: 'q-ang-di-scope',
    technology: T,
    question: 'How does Angular\'s dependency injection hierarchy work? What is the difference between root, module, and component providers?',
    category: 'Core Architecture',
    difficulty: 'advanced',
    tags: ['dependency injection', 'providers', 'injector hierarchy', 'scope', 'singleton'],
    quickAnswer: 'providedIn: root → single application-wide singleton. Module provider → singleton within that module\'s injector. Component provider → new instance per component, destroyed with it.',
    interviewAnswer: `Angular has a hierarchical injector tree: root injector → lazy module injectors → component injectors. Service resolution walks up until it finds a provider.

providedIn: 'root': injected into the root injector. Singleton for the entire app. Tree-shakeable — not included in the bundle if no component injects it. Use for: AuthService, HttpClient, global state.

Module-level providers (NgModule.providers): scoped to that module's injector. For lazily-loaded modules: each lazy module gets its own injector, so if two lazy modules both provide a service, they each get their own singleton. This is a common source of "why do I have two instances of my service" bugs.

@Component({ providers: [MyService] }): creates a new instance of MyService for this component and all its descendants. The instance is destroyed when the component is destroyed. Use for: per-form state, per-widget state.

Standalone components: same rules apply, but you use providers on the component or use importProvidersFrom() in the bootstrapApplication call.`,
    codeExample: `// Root singleton (the default for most services)
@Injectable({ providedIn: 'root' })
export class AuthService {}

// Component-scoped (new instance per instantiation)
@Injectable()
export class EditFormService { isDirty = false; }

@Component({
  providers: [EditFormService],  // each EditFormComponent gets its OWN instance
})
export class EditFormComponent {
  form = inject(EditFormService);
}

// Two sibling EditFormComponents → two independent EditFormService instances
// Component destroyed → EditFormService instance destroyed (no memory leak)`,
    codeLanguage: 'TypeScript',
    followUpQuestions: [
      { question: 'If two lazy-loaded modules both import ServiceModule, do they share the same service instance?', hint: 'No — each lazy module gets its own injector and its own singleton. This surprises most developers.' },
    ],
    keyTerms: ['injector hierarchy', 'providedIn root', 'component providers', 'lazy module injector', 'singleton', 'tree-shaking'],
    commonMistakes: ['Providing stateful services in multiple places expecting one instance', 'Not destroying component-scoped services (they are automatically destroyed — this is the correct behaviour)'],
    interviewerIntent: 'Tests deep DI knowledge — a common source of bugs in large Angular apps.',
    whatIsTested: ['Injector hierarchy', 'Scope semantics', 'Lazy module isolation'],
    topicId: 'ang-dependency-injection',
  },
  {
    id: 'q-ang-performance-optimisations',
    technology: T,
    question: 'Walk me through the performance optimisations you apply to a production Angular application.',
    category: 'Performance',
    difficulty: 'advanced',
    tags: ['performance', 'lazy loading', 'OnPush', 'trackBy', 'defer', 'SSR', 'bundle size'],
    quickAnswer: 'OnPush + signals everywhere, lazy routes + defer blocks, trackBy for lists, pure pipes, SSR + hydration, tree-shaking unused imports.',
    interviewAnswer: `I approach Angular performance in layers from easiest/highest-impact to complex:

1. Change detection (highest impact, low effort):
- ChangeDetectionStrategy.OnPush on every component (prevents unnecessary checks on unchanged subtrees).
- Angular 17+ signals for fine-grained reactivity without Zone.js overhead.

2. Bundle size and initial load:
- loadComponent() / loadChildren() for all feature routes (route-level code splitting).
- @defer blocks for below-the-fold content (charts, complex widgets).
- Avoid large eagerly-imported libraries (moment.js → date-fns, lodash → individual imports).

3. Large lists:
- trackBy function on every *ngFor. Without it, Angular destroys and recreates all DOM nodes on any data change.
- Virtual scrolling (CDK VirtualScrollViewport) for thousands of rows.

4. HTTP and data:
- Cache API responses (HTTP interceptor + Map cache).
- Combine multiple API calls with combineLatest/forkJoin instead of sequential subscribe chains.

5. SSR + pre-rendering:
- Angular Universal / Angular 17's built-in SSR for improved first contentful paint and SEO.
- Non-destructive hydration to avoid full re-render on the client.

6. Tooling:
- Angular DevTools profiler to identify bottlenecks.
- Lighthouse/WebPageTest for Largest Contentful Paint, Time to Interactive.`,
    codeExample: `// trackBy — prevents full list re-render
@Component({
  template: \`
    <cdk-virtual-scroll-viewport itemSize="56" style="height:400px">
      <div *cdkVirtualFor="let txn of transactions; trackBy: trackById">
        {{ txn.id }} — {{ txn.amount | currency }}
      </div>
    </cdk-virtual-scroll-viewport>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent {
  trackById = (_: number, txn: Transaction) => txn.id;
}`,
    codeLanguage: 'TypeScript',
    followUpQuestions: [
      { question: 'What is the difference between lazy loading a module and using @defer?', hint: 'Lazy module loading is route-triggered at navigation time. @defer is template-triggered on viewport/idle/interaction — finer-grained.' },
      { question: 'How do you profile change detection performance?', hint: 'Angular DevTools → Profiler tab → record a session → see which component took most CD time.' },
    ],
    keyTerms: ['OnPush', 'trackBy', 'lazy loading', '@defer', 'virtual scroll', 'SSR hydration', 'bundle splitting'],
    commonMistakes: ['Missing trackBy on large *ngFor lists', 'No lazy loading (entire app in one bundle)'],
    interviewerIntent: 'Tests hands-on Angular performance engineering — expected for senior Angular developer roles.',
    whatIsTested: ['Performance techniques', 'Measurement approach', 'Trade-off awareness'],
    topicId: 'ang-performance',
  },
  {
    id: 'q-ang-signals-vs-rxjs',
    technology: T,
    question: 'What are Angular Signals and when do you use them instead of RxJS?',
    category: 'Core Architecture',
    difficulty: 'advanced',
    tags: ['signals', 'RxJS', 'Angular 17', 'reactivity', 'state management'],
    quickAnswer: 'Signals: synchronous fine-grained reactive primitives for local component and service state — simpler than RxJS, no subscription management. RxJS: async event streams, complex operators, HTTP, timing — still the right tool.',
    interviewAnswer: `Angular Signals (stable in Angular 17) are a new reactive primitive that replaces many common RxJS uses for state management:

signal(initialValue): mutable reactive value. Reading it in a template or computed() registers a dependency.
computed(() => expr): derived value, recomputed only when dependencies change. Memoised.
effect(() => sideEffect): runs when any read signal changes.

When to prefer Signals:
- Local component state that drives the template.
- Service-level state (replacing BehaviorSubject + asObservable() pattern).
- Derived state (replacing selector memoisation for simple cases).
- No subscription management required — no takeUntil, no async pipe, no manual unsubscribe.

When to keep RxJS:
- HTTP requests (HttpClient returns Observable — toSignal() bridges it if needed).
- Complex async coordination (debounce, switchMap, combineLatest, retry logic).
- Router events, WebSockets, any true event stream.
- NgRx effects.

Bridging: toSignal(observable$) wraps any Observable as a signal; toObservable(mySignal) goes the other way.`,
    codeExample: `import { signal, computed, effect, toSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

// Service using signals for state
@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([]);
  count = computed(() => this.items().length);
  total = computed(() => this.items().reduce((s, i) => s + i.price, 0));

  add(item: CartItem) { this.items.update(arr => [...arr, item]); }
  remove(id: string) { this.items.update(arr => arr.filter(i => i.id !== id)); }
}

// Component — no subscribe, no async pipe needed for local state
@Component({
  template: \`Cart: {{ cart.count() }} items — SGD {{ cart.total() }}\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  cart = inject(CartService);

  // Bridge: HTTP Observable → Signal (auto-subscribes, cleans up with component)
  private accounts$ = inject(AccountService).getAccounts();
  accounts = toSignal(this.accounts$, { initialValue: [] });
}`,
    codeLanguage: 'TypeScript',
    followUpQuestions: [
      { question: 'How do Signals interact with NgRx?', hint: 'NgRx 17 Signal Store uses signals natively. selectSignal() exposes NgRx store selectors as signals.' },
      { question: 'What is the difference between signal() and a BehaviorSubject?', hint: 'Both hold a current value and notify subscribers. signal is synchronous and simpler; BehaviorSubject participates in the full RxJS operator chain.' },
    ],
    keyTerms: ['signal', 'computed', 'effect', 'toSignal', 'toObservable', 'fine-grained reactivity'],
    commonMistakes: ['Replacing all RxJS with signals (HTTP, complex async still need RxJS)', 'Using effect() for state derivation (use computed() instead)'],
    interviewerIntent: 'Tests awareness of the Angular 17+ reactive model — expected for senior roles working on modern Angular codebases.',
    whatIsTested: ['Signal API', 'Signals vs RxJS use cases', 'Bridging'],
    topicId: 'ang-component-architecture',
  },
  {
    id: 'q-ang-ngrx-vs-signals',
    technology: T,
    question: 'When would you use NgRx over simpler state management in Angular?',
    category: 'State Management',
    difficulty: 'advanced',
    tags: ['NgRx', 'state management', 'signals', 'Redux', 'architecture'],
    quickAnswer: 'NgRx for large multi-team apps needing predictable Redux-style state, time-travel debugging, and structured effect pipelines. Services + signals for smaller apps.',
    interviewAnswer: `Start with the simplest thing that works:

Services + Signals: A service holding signal() state, computed() for derived values, and injected into components. Works for: single-team projects, per-feature state that doesn't need cross-feature sharing, no complex async.

NgRx: justified when you need:
1. Single source of truth across many feature teams (everyone dispatches actions, no direct state mutation).
2. Time-travel debugging with Redux DevTools.
3. Structured, testable side-effect management (Effects are declarative RxJS pipelines, separately unit-testable).
4. Strong contracts between features (actions are explicit events, typed with props<>()).
5. Router + entity management tooling (NgRx Router Store, @ngrx/entity).

NgRx Signal Store (NgRx 17): bridging option — uses signals instead of the classic Store+Reducer pattern, with NgRx's structured methodology but without the Redux boilerplate overhead.

Cost of NgRx: learning curve, verbose boilerplate (reducers per action, effect per HTTP call), tight coupling to NgRx patterns. Justified at 5+ feature teams and 20+ features; overkill for a 3-person team.`,
    codeExample: `// NgRx Signal Store (NgRx 17) — less boilerplate
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';

export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState({ accounts: [] as Account[], loading: false }),
  withMethods((store, api = inject(AccountsService)) => ({
    async loadAccounts() {
      patchState(store, { loading: true });
      const accounts = await api.getAccounts();
      patchState(store, { accounts, loading: false });
    }
  }))
);

// In component
@Component({ template: \`
  @if (store.loading()) { <spinner /> }
  @for (a of store.accounts(); track a.id) {
    <account-row [account]="a" />
  }
\` })
export class AccountsComponent {
  store = inject(AccountsStore);
  ngOnInit() { this.store.loadAccounts(); }
}`,
    codeLanguage: 'TypeScript',
    followUpQuestions: [
      { question: 'How do you test NgRx effects?', hint: 'provideMockActions() streams a ReplaySubject; marbles testing for timing-sensitive effects.' },
    ],
    keyTerms: ['NgRx', 'NgRx Signal Store', 'Redux', 'effects', 'actions', 'reducers', 'selectors'],
    commonMistakes: ['Reaching for NgRx for a simple 3-page app', 'Storing all UI state (modal open/closed) in NgRx (should be local component state)'],
    interviewerIntent: 'Tests architectural judgment for state management — a hallmark senior Angular developer question.',
    whatIsTested: ['NgRx trade-offs', 'Decision criteria', 'Modern NgRx Signal Store awareness'],
    topicId: 'ang-state-management',
  },
];
