import { reactFundamentalsTopics } from './fundamentals';
import { reactHooksTopics } from './hooks';
import { reactPerformanceTopics } from './performance';
import { reactStateTopics } from './state';
import { reactTypescriptTopics } from './typescript';
import { reactArchitectureTopics } from './architecture';
import { react19Topics } from './react19';
import { reactEcosystemTopics } from './ecosystem';
import type { LearningTopic } from '../../../types';

export const reactTopics: LearningTopic[] = [
  ...reactFundamentalsTopics,
  ...reactHooksTopics,
  ...reactPerformanceTopics,
  ...reactStateTopics,
  ...reactTypescriptTopics,
  ...reactArchitectureTopics,
  ...react19Topics,
  ...reactEcosystemTopics,
];

export const reactTopicCategories = Array.from(new Set(reactTopics.map((t) => t.category)));
