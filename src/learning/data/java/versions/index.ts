/**
 * JAVA VERSION METADATA — sourced from Oracle / OpenJDK.
 *
 * Every JEP number, release date and status below was verified against
 * openjdk.org, oracle.com and the Oracle Java SE Support Roadmap. Nothing
 * here is invented. If a JEP's exact finalization status could not be
 * confirmed with confidence, it is omitted rather than guessed.
 *
 * Java ships a feature release every 6 months (March / September); this
 * data was last verified against primary sources on the date below. Check
 * openjdk.org for anything newer before relying on it in an interview.
 */

import type { JavaVersionMeta } from '../../../types';

export const VERSION_DATA_VERIFIED_ON = '2026-09-06';
export const VERSION_DATA_SOURCE_NOTE =
  'Verified against openjdk.org, oracle.com and the Oracle Java SE Support Roadmap. Java ships a feature release every 6 months (March / September) — check openjdk.org for anything newer.';

export const javaVersions: JavaVersionMeta[] = [
  {
    version: 8,
    releaseDate: '2014-03-18',
    isLTS: true,
    status: 'legacy',
    sourceUrl: 'https://openjdk.org/projects/jdk8/features',
    highlights: [
      'Lambda expressions and functional interfaces',
      'Stream API for bulk/collection data operations',
      'java.time — the modern Date & Time API (JSR 310)',
      'Default and static methods on interfaces',
    ],
    jeps: [
      {
        id: 126,
        title: 'Lambda Expressions & Virtual Extension Methods',
        status: 'stable',
        summary: 'Added lambda expressions, method references and default/static interface methods to the language.',
      },
      {
        id: 107,
        title: 'Bulk Data Operations for Collections',
        status: 'stable',
        summary: 'The java.util.stream API — filter/map/reduce style serial and parallel operations over collections.',
      },
      {
        id: 150,
        title: 'Date & Time API',
        status: 'stable',
        summary: 'java.time — an immutable, thread-safe replacement for the old Date and Calendar classes (JSR 310).',
      },
    ],
  },
  {
    version: 11,
    releaseDate: '2018-09-25',
    isLTS: true,
    status: 'legacy',
    eoslPremier: '2023-09',
    sourceUrl: 'https://openjdk.org/projects/jdk/11/',
    highlights: [
      'HTTP Client API standardized (replacing HttpURLConnection for new code)',
      'var allowed in lambda parameter declarations',
      'Flight Recorder (JFR) open-sourced and bundled',
      'Nest-based access control for nested classes',
    ],
    jeps: [
      { id: 181, title: 'Nest-Based Access Control', status: 'stable', summary: 'Lets nested classes access each other\u2019s private members without synthetic bridge methods.' },
      { id: 321, title: 'HTTP Client (Standard)', status: 'stable', summary: 'Standardized the incubating HTTP/2-capable HTTP Client introduced in JDK 9.' },
      { id: 323, title: 'Local-Variable Syntax for Lambda Parameters', status: 'stable', summary: 'Allows var for implicitly-typed lambda parameters, mainly to attach annotations consistently.' },
      { id: 328, title: 'Flight Recorder', status: 'stable', summary: 'Open-sourced the low-overhead profiling and diagnostics framework (JFR) into OpenJDK.' },
    ],
  },
  {
    version: 17,
    releaseDate: '2021-09-14',
    isLTS: true,
    status: 'supported',
    eoslPremier: '2026-09',
    sourceUrl: 'https://openjdk.org/projects/jdk/17',
    highlights: [
      'Sealed classes finalized (restrict which types may extend/implement)',
      'Pattern matching for switch — first preview',
      'Enhanced pseudo-random number generators',
      'Strong encapsulation of internal JDK APIs by default',
    ],
    jeps: [
      { id: 409, title: 'Sealed Classes', status: 'stable', summary: 'Finalizes sealed classes/interfaces, first previewed in JDK 15. Restricts which other types may extend or implement a type.' },
      { id: 406, title: 'Pattern Matching for switch (Preview)', status: 'preview', summary: 'First preview of allowing patterns (not just constants) in switch case labels; finalized later in JDK 21 as JEP 441.' },
      { id: 356, title: 'Enhanced Pseudo-Random Number Generators', status: 'stable', summary: 'New PRNG interface types, including jumpable and splittable algorithms.' },
      { id: 403, title: 'Strongly Encapsulate JDK Internals', status: 'stable', summary: 'Internal JDK elements are strongly encapsulated by default, except critical APIs like sun.misc.Unsafe.' },
    ],
  },
  {
    version: 21,
    releaseDate: '2023-09-19',
    isLTS: true,
    status: 'supported',
    eoslPremier: '2028-09',
    sourceUrl: 'https://openjdk.org/projects/jdk/21',
    highlights: [
      'Virtual Threads finalized — the headline result of Project Loom',
      'Pattern matching for switch and record patterns finalized',
      'Sequenced Collections — a consistent encounter-order API',
      'Structured Concurrency and Scoped Values — still preview',
    ],
    jeps: [
      { id: 444, title: 'Virtual Threads', status: 'stable', summary: 'Lightweight, JVM-scheduled threads that let blocking-style code scale to huge numbers of concurrent tasks.' },
      { id: 441, title: 'Pattern Matching for switch', status: 'stable', summary: 'Finalizes pattern matching in switch, after previews in JDK 17, 18, 19 and 20.' },
      { id: 440, title: 'Record Patterns', status: 'stable', summary: 'Deconstructs record values directly in patterns, composable with pattern matching for switch.' },
      { id: 431, title: 'Sequenced Collections', status: 'stable', summary: 'New interfaces exposing a defined encounter order with first/last accessors and reversed views.' },
      { id: 453, title: 'Structured Concurrency (Preview)', status: 'preview', summary: 'Treats a group of related subtasks running in different threads as a single unit of work.' },
      { id: 446, title: 'Scoped Values (Preview)', status: 'preview', summary: 'Share immutable data within a thread and with child threads, as a safer alternative to some ThreadLocal uses.' },
    ],
  },
  {
    version: 25,
    releaseDate: '2025-09-16',
    isLTS: true,
    status: 'current-lts',
    eoslPremier: '2030-09',
    sourceUrl: 'https://openjdk.org/projects/jdk/25/',
    highlights: [
      'Current LTS release — 18 JEPs, 7 finalized from earlier previews',
      'Scoped Values and Module Import Declarations finalized',
      'Compact Object Headers and Generational Shenandoah for lower memory/pause overhead',
      'Structured Concurrency continues in preview (5th preview)',
    ],
    jeps: [
      { id: 506, title: 'Scoped Values', status: 'stable', summary: 'Finalizes sharing immutable data with child threads, previewed since JDK 21.' },
      { id: 511, title: 'Module Import Declarations', status: 'stable', summary: 'Lets code import all packages exported by a module without the importing code itself being modular.' },
      { id: 512, title: 'Compact Source Files and Instance Main Methods', status: 'stable', summary: 'Lets beginners write a first program without classes, access modifiers or a static main signature.' },
      { id: 513, title: 'Flexible Constructor Bodies', status: 'stable', summary: 'Allows statements before an explicit super(...)/this(...) call, as long as they don\u2019t reference the instance.' },
      { id: 519, title: 'Compact Object Headers', status: 'stable', summary: 'Shrinks the per-object header, reducing heap footprint and GC pressure.' },
      { id: 521, title: 'Generational Shenandoah', status: 'stable', summary: 'Adds generational collection to the low-pause Shenandoah garbage collector.' },
      { id: 510, title: 'Key Derivation Function API', status: 'stable', summary: 'A standard API for cryptographic key-derivation functions.' },
      { id: 503, title: 'Remove the 32-bit x86 Port', status: 'stable', summary: 'Removes the deprecated 32-bit x86 port and associated build support.' },
      { id: 505, title: 'Structured Concurrency (Fifth Preview)', status: 'preview', summary: 'Continues refining StructuredTaskScope; still a disabled-by-default preview API.' },
      { id: 507, title: 'Primitive Types in Patterns, instanceof, and switch (Third Preview)', status: 'preview', summary: 'Extends pattern matching, instanceof and switch to work uniformly with primitive types.' },
      { id: 502, title: 'Stable Values (Preview)', status: 'preview', summary: 'API for values computed at most once, with performance similar to final fields but flexible initialization timing.' },
      { id: 470, title: 'PEM Encodings of Cryptographic Objects (Preview)', status: 'preview', summary: 'Encode/decode keys, certificates and CRLs to/from the PEM transport format.' },
      { id: 508, title: 'Vector API (Tenth Incubator)', status: 'incubator', summary: 'Expresses vector computations that compile to optimal SIMD instructions on supported CPUs.' },
    ],
  },
  {
    version: 26,
    releaseDate: '2026-03-17',
    isLTS: false,
    status: 'current',
    eoslPremier: '2026-09',
    sourceUrl: 'https://openjdk.org/projects/jdk/26/',
    highlights: [
      'Latest feature release (non-LTS) — 10 JEPs: 5 stable, 4 preview, 1 incubator',
      'HTTP/3 support added to the HTTP Client API',
      'G1 GC throughput improved by reducing synchronization',
      'Structured Concurrency now in its 6th preview — still not finalized',
    ],
    jeps: [
      { id: 517, title: 'HTTP/3 for the HTTP Client API', status: 'stable', summary: 'The HTTP Client API gains HTTP/3 support alongside existing HTTP/1.1 and HTTP/2.' },
      { id: 522, title: 'G1 GC: Improve Throughput by Reducing Synchronization', status: 'stable', summary: 'Reduces synchronization overhead in the default G1 collector to raise application throughput.' },
      { id: 516, title: 'Ahead-of-Time Object Caching with Any GC', status: 'stable', summary: 'Extends AOT object caching (Project Leyden) to work with any garbage collector, not just G1.' },
      { id: 500, title: 'Prepare to Make Final Mean Final', status: 'stable', summary: 'Warns ahead of a future change that will make final truly final for fields accessed via deep reflection.' },
      { id: 504, title: 'Remove the Applet API', status: 'stable', summary: 'Removes the long-deprecated java.applet API.' },
      { id: 525, title: 'Structured Concurrency (Sixth Preview)', status: 'preview', summary: 'Still a preview API; adds an onTimeout() callback and refines join-policy return types.' },
      { id: 530, title: 'Primitive Types in Patterns, instanceof, and switch (Fourth Preview)', status: 'preview', summary: 'Continued preview of primitive-type pattern matching support.' },
      { id: 524, title: 'PEM Encodings of Cryptographic Objects (Second Preview)', status: 'preview', summary: 'Second preview of the PEM encode/decode API introduced in JDK 25.' },
      { id: 526, title: 'Lazy Constants (Second Preview)', status: 'preview', summary: 'Second preview of the API previously named Stable Values in JDK 25.' },
      { id: 529, title: 'Vector API (Eleventh Incubator)', status: 'incubator', summary: 'Eleventh incubation round of the SIMD-oriented Vector API.' },
    ],
  },
];

export function getVersion(version: number): JavaVersionMeta | undefined {
  return javaVersions.find((v) => v.version === version);
}

export const latestVersion = javaVersions[javaVersions.length - 1];
export const latestLTS = [...javaVersions].reverse().find((v) => v.isLTS)!;
