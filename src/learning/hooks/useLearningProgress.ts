/**
 * LEARNING PROGRESS — localStorage-backed tracking.
 *
 * This is a personal, local memory aid, not an objective knowledge score —
 * every place this data is surfaced should be labelled as such.
 */

import { useCallback, useEffect, useState } from 'react';

export type Confidence = 'unknown' | 'partial' | 'good' | 'strong';
export type FlashcardStatus = 'known' | 'review';

interface ProgressState {
  topicsViewed: string[];
  questionConfidence: Record<string, Confidence>;
  bookmarks: string[];
  reviewLater: string[];
  flashcardStatus: Record<string, FlashcardStatus>;
}

const STORAGE_KEY = 'eip-learning-progress';

const EMPTY_STATE: ProgressState = {
  topicsViewed: [],
  questionConfidence: {},
  bookmarks: [],
  reviewLater: [],
  flashcardStatus: {},
};

function readState(): ProgressState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<ProgressState>) } : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: ProgressState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable — progress just won't persist.
  }
}

export function useLearningProgress() {
  const [state, setState] = useState<ProgressState>(readState);

  useEffect(() => writeState(state), [state]);

  const markTopicViewed = useCallback((topicId: string) => {
    setState((s) => (s.topicsViewed.includes(topicId) ? s : { ...s, topicsViewed: [...s.topicsViewed, topicId] }));
  }, []);

  const toggleBookmark = useCallback((topicId: string) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(topicId) ? s.bookmarks.filter((id) => id !== topicId) : [...s.bookmarks, topicId],
    }));
  }, []);

  const toggleReviewLater = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      reviewLater: s.reviewLater.includes(id) ? s.reviewLater.filter((x) => x !== id) : [...s.reviewLater, id],
    }));
  }, []);

  const setQuestionConfidence = useCallback((questionId: string, confidence: Confidence) => {
    setState((s) => ({ ...s, questionConfidence: { ...s.questionConfidence, [questionId]: confidence } }));
  }, []);

  const setFlashcardStatus = useCallback((topicId: string, status: FlashcardStatus) => {
    setState((s) => ({ ...s, flashcardStatus: { ...s.flashcardStatus, [topicId]: status } }));
  }, []);

  const isBookmarked = useCallback((topicId: string) => state.bookmarks.includes(topicId), [state.bookmarks]);
  const isReviewLater = useCallback((id: string) => state.reviewLater.includes(id), [state.reviewLater]);

  return {
    topicsViewed: state.topicsViewed,
    bookmarks: state.bookmarks,
    reviewLater: state.reviewLater,
    questionConfidence: state.questionConfidence,
    flashcardStatus: state.flashcardStatus,
    markTopicViewed,
    toggleBookmark,
    toggleReviewLater,
    setQuestionConfidence,
    setFlashcardStatus,
    isBookmarked,
    isReviewLater,
  };
}
