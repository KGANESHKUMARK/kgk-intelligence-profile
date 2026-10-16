import { pythonCodingTopics } from './coding';
import { pythonDsaTopics } from './dsa';
import { pythonFundamentalsTopics } from './fundamentals';
import { pythonProductionTopics } from './production';
import type { LearningTopic } from '../../../types';

export const pythonTopics: LearningTopic[] = [
  ...pythonCodingTopics,
  ...pythonDsaTopics,
  ...pythonFundamentalsTopics,
  ...pythonProductionTopics,
];

export const pythonTopicCategories = Array.from(new Set(pythonTopics.map((t) => t.category)));
