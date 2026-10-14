import type { LearningTopic } from '../../types';

const T = 'angular';

export const angularTopics: LearningTopic[] = [
  /* ─────────────────────────────────────── Core Architecture ─────────────── */
  {
    id: 'ang-component-architecture',
    technology: T,
    title: 'Component Architecture & Change Detection',
    category: 'Core Architecture',
    slug: 'ang-component-architecture',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Angular components are the fundamental UI building blocks; change detection determines when and how the DOM is updated.',
    mentalModel: 'Components are boxes in a tree. Change detection walks the tree after every browser event to find which boxes need repainting. OnPush prunes whole branches.',
    memoryTip: 'Default CD = checks everything after every event. OnPush = checks only when @Input reference changes or Observable emits. Use OnPush everywhere with immutable inputs.',
    keyTerms: ['component', 'decorator', 'template', 'change detection', 'ChangeDetectionStrategy.OnPush', 'ViewEncapsulation', 'lifecycle hooks', 'signals'],
    interviewAnswer: `An Angular component combines template (HTML), styles, and class logic decorated with @Component. Angular's default change detection (Zone.js-based) runs after every async event (click, setTimeout, XHR) and checks every component in the tree — O(N) in tree size.

ChangeDetectionStrategy.OnPush is the performance lever: Angular skips a component and its subtree unless:
1. An @Input reference changes (not just a mutated object — a new object reference).
2. An event originates from the component or its children.
3. An Observable bound with async pipe emits.
4. markForCheck() is called manually.

With OnPush, the entire tree below a component is pruned from the CD cycle unless triggered. Use it with immutable data patterns (spread operators, slice for arrays) to maximise pruning.

Angular 17+ Signals: fine-grained reactivity without Zone.js. Computed signals update only when their dependencies change. signal() / computed() / effect() replace OnPush discipline with automatic fine-grained updates.`,
    codeExample: `import { Component, Input, ChangeDetectionStrategy, signal, computed } from '@angular/core';

// Classic OnPush pattern
@Component({
  selector: 'app-account-row',
  template: \`<div>{{ account.id }} - {{ account.balance | currency }}</div>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,  // skips if @Input ref unchanged
})
export class AccountRowComponent {
  @Input() account!: { id: string; balance: number };
}

// Angular 17+ Signals — no Zone.js needed
@Component({
  selector: 'app-balance',
  template: \`<div>Balance: {{ displayBalance() }}</div>
             <button (click)="deposit(100)">+100</button>\`,
  standalone: true,
})
export class BalanceComponent {
  private balance = signal(1000);
  displayBalance = computed(() => \`SGD \${this.balance().toFixed(2)}\`);

  deposit(amount: number) {
    this.balance.update(b => b + amount);  // triggers only components using this signal
  }
}`,
    codeLanguage: 'TypeScript',
    whyOutput: 'OnPush prevents unnecessary checks for rows that did not change (important for large lists). Signals go further: only the exact template expression that reads the signal re-renders.',
    commonMistakes: [
      'Mutating an @Input object instead of replacing the reference (OnPush does not detect mutation).',
      'Using Default CD for large component trees (performance cliff).',
      'Calling markForCheck() in a loop (defeats the purpose of OnPush).',
    ],
    seniorInsight: `With Angular 17+ and standalone components + signals, you can build fully Zone.js-free applications (provideExperimentalZonelessChangeDetection()). This reduces bundle size and improves startup time. The migration path is: add OnPush everywhere first, then progressively convert to signals.`,
    prerequisites: [],
    relatedTopics: ['ang-dependency-injection', 'ang-rxjs-patterns', 'ang-performance'],
    nextTopics: ['ang-dependency-injection', 'ang-rxjs-patterns'],
    references: [
      { title: 'Angular Change Detection — angular.dev', url: 'https://angular.dev/guide/change-detection', source: 'Angular', type: 'documentation' },
    ],
    interviewQuestions: ['q-ang-change-detection', 'q-ang-signals-vs-rxjs'],
  },
  {
    id: 'ang-dependency-injection',
    technology: T,
    title: 'Dependency Injection & Providers',
    category: 'Core Architecture',
    slug: 'ang-dependency-injection',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Angular\'s DI system constructs and provides services to components, with scope controlled by where you provide them (root, module, component).',
    mentalModel: 'Think of DI as a typed factory registry. You register a blueprint (provider) and consumers declare what they need (@Inject); Angular\'s injector hierarchy resolves the right instance.',
    memoryTip: 'providedIn: "root" → singleton application-wide. Component-provided → new instance per component subtree. Hierarchical injectors form a tree matching the component tree.',
    keyTerms: ['@Injectable', 'providedIn', 'injector hierarchy', 'InjectionToken', 'useValue', 'useFactory', 'useExisting', 'lazy module injector'],
    interviewAnswer: `Angular has a hierarchical injector tree: root injector → module injectors → component injectors. When a component needs a service, Angular walks up the injector tree until it finds a provider.

providedIn: 'root': service is a singleton across the application; tree-shakeable (not included if unused). The default for application-wide services (AuthService, HttpClient).

Component-level provider: @Component({ providers: [MyService] }) creates a new instance for that component and its descendants. Use for services that should NOT be singletons (form state, animation state). The instance is destroyed with the component.

InjectionToken: for non-class injectables (config objects, strings, feature flags). Avoids using class constructor for non-class values.

Multi-provider: provide multiple values for the same token (interceptors, guards, validators).`,
    codeExample: `import { Injectable, InjectionToken, inject } from '@angular/core';

// Application-wide singleton
@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = false;
}

// Component-scoped service (new instance per component)
@Injectable()
export class FormStateService {
  isDirty = false;
}

// InjectionToken for config
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// In component
@Component({
  providers: [FormStateService],   // new instance for this component subtree
  template: \`...\`,
})
export class EditFormComponent {
  private auth = inject(AuthService);        // singleton from root
  private form = inject(FormStateService);   // scoped instance
  private apiUrl = inject(API_BASE_URL);     // config from token
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Providing a stateful service in a lazily-loaded module — it gets its own injector and a separate singleton from any other lazy module.',
      'Not using InjectionToken for primitive values (string/boolean providers).',
      'Component-provided service not being destroyed with the component (memory leak if stored externally).',
    ],
    prerequisites: ['ang-component-architecture'],
    relatedTopics: ['ang-rxjs-patterns'],
    references: [
      { title: 'Understanding Dependency Injection — angular.dev', url: 'https://angular.dev/guide/di', source: 'Angular', type: 'documentation' },
    ],
    interviewQuestions: ['q-ang-di-scope'],
  },
  {
    id: 'ang-rxjs-patterns',
    technology: T,
    title: 'RxJS Patterns in Angular',
    category: 'Reactive Programming',
    slug: 'ang-rxjs-patterns',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Angular\'s reactive layer — services expose Observables, components subscribe via async pipe, operators transform and compose data streams.',
    mentalModel: 'RxJS is a production line with conveyor belts (Observables). Operators are machines that transform, filter, or combine the items on the belt. async pipe subscribes and auto-cleans up.',
    memoryTip: 'switchMap for "cancel previous, take latest" (search). mergeMap for "run in parallel" (fire-and-forget). concatMap for "queue, ordered" (sequential save). exhaustMap for "ignore new while running" (login button).',
    keyTerms: ['Observable', 'Subject', 'BehaviorSubject', 'async pipe', 'switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'takeUntil', 'combineLatest'],
    interviewAnswer: `Angular uses RxJS throughout: HttpClient returns Observables, Router events are Observable, form valueChanges is Observable.

Key patterns:
- async pipe: subscribes in the template, automatically unsubscribes when the component is destroyed. Preferred over manual subscribe/unsubscribe.
- Higher-order mapping operators: switchMap cancels the previous inner observable on a new emission (type-ahead search — cancel the in-flight HTTP request when the user types more); exhaustMap ignores new emissions while one is in flight (login button — ignore double-clicks); concatMap queues emissions and processes them in order.
- BehaviorSubject for state: a service holds a BehaviorSubject as state, exposes it as an Observable, components subscribe. State updates go through .next(). Replay to late subscribers.
- Avoid nested subscribes: always use an operator (switchMap, combineLatest) instead of subscribe inside subscribe.
- Cleanup: use takeUntil with a destroy$ subject, or takeUntilDestroyed() from @angular/core (Angular 16+).`,
    codeExample: `import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  template: \`
    <input [formControl]="searchCtrl" placeholder="Search accounts...">
    <ul>
      <li *ngFor="let a of results$ | async">{{ a.id }} - {{ a.name }}</li>
    </ul>
  \`,
})
export class AccountSearchComponent {
  private api = inject(AccountService);
  searchCtrl = new FormControl('');

  results$ = this.searchCtrl.valueChanges.pipe(
    debounceTime(300),                          // wait 300ms after last keystroke
    distinctUntilChanged(),                     // skip if same value as last
    switchMap(term =>                           // cancel previous HTTP, take latest
      this.api.search(term ?? '').pipe(
        catchError(() => of([]))                // on error, return empty list
      )
    )
  );
  // No subscribe() needed — async pipe manages lifecycle
}`,
    codeLanguage: 'TypeScript',
    whyOutput: 'debounceTime stops the API being called on every keystroke. distinctUntilChanged skips if the user deletes and retypes the same query. switchMap cancels the previous HTTP request when a new term arrives — the UI always shows results for the latest query, never a stale earlier one.',
    commonMistakes: [
      'Nested subscribe inside subscribe (memory leaks, race conditions).',
      'Using mergeMap for HTTP mutations in forms (can apply earlier response over later one).',
      'Not unsubscribing (takeUntil or async pipe).',
    ],
    seniorInsight: `RxJS is powerful but hard to debug. Use of(value) for synchronous sources in tests, marble testing for complex operator chains. In Angular 17+ with signals, most state management moves to signals; RxJS remains for event streams and complex async coordination.`,
    prerequisites: ['ang-component-architecture'],
    relatedTopics: ['ang-state-management', 'ang-performance'],
    references: [
      { title: 'RxJS — Operator Decision Tree', url: 'https://rxjs.dev/operator-decision-tree', source: 'RxJS', type: 'documentation' },
    ],
    interviewQuestions: ['q-ang-switchmap-vs-mergemap', 'q-ang-change-detection'],
  },
  {
    id: 'ang-performance',
    technology: T,
    title: 'Angular Performance — Lazy Loading, SSR, Deferrable Views',
    category: 'Performance',
    slug: 'ang-performance',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Key levers: OnPush everywhere, lazy-loaded feature modules, route-level code splitting, defer blocks for below-the-fold content, SSR/pre-rendering for first-paint.',
    mentalModel: 'Angular performance is a series of surgical cuts: reduce what is checked (OnPush/signals), reduce what is loaded initially (lazy routing), reduce what is rendered server-side (SSR), and defer what is not yet visible (defer blocks).',
    memoryTip: 'OnPush + Signals → lazy routes → defer blocks → SSR + hydration. Measure with Angular DevTools / Lighthouse before and after each change.',
    keyTerms: ['lazy loading', 'loadComponent', 'loadChildren', '@defer', 'SSR', 'Angular Universal', 'hydration', 'OnPush', 'signals', 'trackBy'],
    interviewAnswer: `Angular 17+ performance toolkit:

1. OnPush / Signals: skip change detection on unchanged subtrees. The highest-leverage change.

2. Lazy routing: loadComponent() / loadChildren() split the bundle at route boundaries. Only the initial route's code is downloaded on first load.

3. @defer blocks (Angular 17): declaratively defer template sections until a trigger (viewport, idle, timer, interaction). The deferred section is code-split automatically.

4. SSR + incremental hydration: Angular Universal renders HTML server-side for fast first contentful paint; the client hydrates incrementally. Angular 17 adds partial hydration to hydrate only the interactive components.

5. trackBy for *ngFor: prevents Angular from destroying and recreating DOM nodes when only data changes.

6. Pure pipes: computed in the template but memoised — only recalculated if the input changes.`,
    codeExample: `// Lazy route — only PaymentsModule loaded when user navigates to /payments
const routes: Routes = [
  { path: 'payments', loadComponent: () =>
      import('./payments/payments.component').then(m => m.PaymentsComponent) },
];

// @defer — dashboard chart only loaded when scrolled into view
// (TypeScript template — shown as text for clarity)
const template = \`
  <app-header />
  <app-account-summary />

  @defer (on viewport) {
    <app-analytics-chart />    <!-- heavy chart component — lazy loaded + rendered -->
  } @placeholder {
    <div class="skeleton h-64" />
  } @loading (minimum 500ms) {
    <app-spinner />
  } @error {
    <p>Chart unavailable</p>
  }
\`;

// trackBy — stable DOM for large transaction lists
const trackByTxn = (_: number, txn: Transaction) => txn.id;`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Missing trackBy on *ngFor with large lists (Angular recreates all DOM nodes on data refresh).',
      'Importing heavy libraries (Chart.js, D3) in eagerly loaded modules.',
      'SSR without hydration strategy (re-renders entire page client-side, defeating the purpose).',
    ],
    prerequisites: ['ang-component-architecture'],
    relatedTopics: ['ang-rxjs-patterns', 'ang-state-management'],
    references: [
      { title: 'Deferrable Views — angular.dev', url: 'https://angular.dev/guide/defer', source: 'Angular', type: 'documentation' },
    ],
    interviewQuestions: ['q-ang-performance-optimisations'],
  },
  {
    id: 'ang-state-management',
    technology: T,
    title: 'State Management — NgRx vs Services vs Signals',
    category: 'State Management',
    slug: 'ang-state-management',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Angular state management spectrum: simple services + BehaviorSubject for small apps, NgRx for large complex apps, Angular Signals for reactive fine-grained state without boilerplate.',
    mentalModel: 'Start simple (service with signal/BehaviorSubject), add NgRx when you need Redux DevTools time-travel, effect pipelines, and cross-team state contracts.',
    memoryTip: 'NgRx: Store = state, Action = intent, Reducer = pure function, Effect = side effects, Selector = memoised query. Component → dispatch(action) → reducer → store → selector → template.',
    keyTerms: ['NgRx', 'store', 'action', 'reducer', 'effect', 'selector', 'BehaviorSubject', 'signal store', 'NGXS', 'Akita'],
    interviewAnswer: `Three patterns by complexity:

1. Service + Signal/BehaviorSubject: For small–medium apps. Service holds state as signal() or BehaviorSubject, exposes derived computed/asObservable(), components inject and subscribe. Simple, low boilerplate, no setup.

2. NgRx (Redux pattern): For large apps with complex state, multiple teams, or need for debugging tooling. Single immutable Store; Actions describe intent; Reducers produce new state; Effects handle async (HTTP, routing); Selectors memoize derived state. Pros: time-travel debugging, predictable state flow, testable. Cons: significant boilerplate (reduced with NgRx Signals API in NgRx 17).

3. NgRx Signal Store (NgRx 17) / Angular Signals: Lightweight fine-grained state without the Redux ceremony. signalStore() defines state as signals. Works with Angular's change detection signal graph — only re-renders the affected bindings.

Decision: < 5 developers, < 10 feature areas → service + signals. Large app with complex async flows and cross-feature state → NgRx.`,
    codeExample: `// NgRx — simple account state
// actions
import { createAction, props } from '@ngrx/store';
export const loadAccounts = createAction('[Accounts] Load');
export const loadAccountsSuccess = createAction('[Accounts] Load Success',
  props<{ accounts: Account[] }>());

// reducer
import { createReducer, on } from '@ngrx/store';
const initialState = { accounts: [] as Account[], loading: false };
export const accountsReducer = createReducer(initialState,
  on(loadAccounts, s => ({ ...s, loading: true })),
  on(loadAccountsSuccess, (s, { accounts }) => ({ ...s, accounts, loading: false }))
);

// effect (side effect: HTTP call)
@Injectable()
export class AccountEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(loadAccounts),
    switchMap(() => this.api.getAccounts().pipe(
      map(accounts => loadAccountsSuccess({ accounts })),
      catchError(() => of(loadAccountsFailure()))
    ))
  ));
  constructor(private actions$: Actions, private api: AccountsService) {}
}

// selector (memoised)
export const selectAccounts = createSelector(selectAccountsFeature, s => s.accounts);`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Using NgRx for a small app (massive boilerplate for minimal benefit).',
      'Storing derived state in NgRx instead of using selectors.',
      'Mutating state in a reducer (must return new object reference).',
    ],
    prerequisites: ['ang-rxjs-patterns', 'ang-component-architecture'],
    relatedTopics: ['ang-performance'],
    references: [
      { title: 'NgRx Docs', url: 'https://ngrx.io/docs', source: 'NgRx', type: 'documentation' },
    ],
    interviewQuestions: ['q-ang-ngrx-vs-signals', 'q-ang-change-detection'],
  },
];
