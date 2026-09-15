import { kafkaCoreTopics } from './core';
import { kafkaProducerTopics } from './producer';
import { kafkaConsumerTopics } from './consumer';
import { kafkaDeliveryTopics } from './delivery';
import { kafkaInfraTopics } from './infra';
import { kafkaEcosystemTopics } from './ecosystem';
import type { LearningTopic } from '../../../types';

export const kafkaTopics: LearningTopic[] = [
  ...kafkaCoreTopics,
  ...kafkaProducerTopics,
  ...kafkaConsumerTopics,
  ...kafkaDeliveryTopics,
  ...kafkaInfraTopics,
  ...kafkaEcosystemTopics,
];

export const kafkaTopicCategories = Array.from(new Set(kafkaTopics.map((t) => t.category)));
