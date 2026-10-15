import { reactCoreQuestions } from './core';
import { reactAdvancedQuestions } from './advanced';
import { reactBankingQuestions } from './banking';
import type { InterviewQuestion } from '../../../types';

export const reactQuestions: InterviewQuestion[] = [...reactCoreQuestions, ...reactAdvancedQuestions, ...reactBankingQuestions];

export const reactQuestionCategories = Array.from(new Set(reactQuestions.map((q) => q.category)));
