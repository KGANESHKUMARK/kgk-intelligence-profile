import { reactCoreQuestions } from './core';
import { reactAdvancedQuestions } from './advanced';
import type { InterviewQuestion } from '../../../types';

export const reactQuestions: InterviewQuestion[] = [...reactCoreQuestions, ...reactAdvancedQuestions];

export const reactQuestionCategories = Array.from(new Set(reactQuestions.map((q) => q.category)));
