import { pythonCodingQuestions } from './coding';
import { pythonDsaQuestions } from './dsa';
import { pythonFundamentalsQuestions } from './fundamentals';
import { pythonProductionQuestions } from './production';
import type { InterviewQuestion } from '../../../types';

export const pythonQuestions: InterviewQuestion[] = [
  ...pythonCodingQuestions,
  ...pythonDsaQuestions,
  ...pythonFundamentalsQuestions,
  ...pythonProductionQuestions,
];

export const pythonQuestionCategories = Array.from(new Set(pythonQuestions.map((q) => q.category)));
