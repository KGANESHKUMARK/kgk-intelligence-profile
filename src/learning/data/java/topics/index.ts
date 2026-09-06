import { collectionsTopics } from './collections';
import { concurrencyTopics } from './concurrency';
import { jvmTopics } from './jvm';
import { java8Topics } from './java8';

export const javaTopics = [...collectionsTopics, ...concurrencyTopics, ...jvmTopics, ...java8Topics];

export function getTopicById(id: string) {
  return javaTopics.find((t) => t.id === id);
}
