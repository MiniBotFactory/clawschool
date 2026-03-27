import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { interactions as interactionsApi, progress as progressApi, evaluations as evaluationsApi } from '../api/storage';
import type { UserInteraction, Evaluation } from '../types';

// 用于管理用户交互（点赞、收藏、订阅）的 hook
export function useInteractions() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const userInteractions = interactionsApi.getUserInteractions(user.id);
      setInteractions(userInteractions);
    } else {
      setInteractions([]);
    }
  }, [user]);

  const addInteraction = useCallback(async (interaction: Omit<UserInteraction, 'timestamp'>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    try {
      const result = interactionsApi.addInteraction(user.id, interaction);
      if (result.success) {
        const updatedInteractions = interactionsApi.getUserInteractions(user.id);
        setInteractions(updatedInteractions);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const removeInteraction = useCallback(async (interaction: Omit<UserInteraction, 'timestamp'>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    try {
      const result = interactionsApi.removeInteraction(user.id, interaction);
      if (result.success) {
        const updatedInteractions = interactionsApi.getUserInteractions(user.id);
        setInteractions(updatedInteractions);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const hasInteraction = useCallback((interaction: Omit<UserInteraction, 'timestamp'>) => {
    if (!user) return false;
    return interactionsApi.hasInteraction(user.id, interaction);
  }, [user]);

  const isLiked = useCallback((resourceId: string) => {
    return hasInteraction({ type: 'like', resourceId });
  }, [hasInteraction]);

  const isCollected = useCallback((resourceId: string) => {
    return hasInteraction({ type: 'collect', resourceId });
  }, [hasInteraction]);

  const isSubscribed = useCallback((courseSetId: string) => {
    return hasInteraction({ type: 'subscribe', courseSetId });
  }, [hasInteraction]);

  const toggleLike = useCallback(async (resourceId: string) => {
    if (isLiked(resourceId)) {
      return removeInteraction({ type: 'like', resourceId });
    } else {
      return addInteraction({ type: 'like', resourceId });
    }
  }, [isLiked, addInteraction, removeInteraction]);

  const toggleCollect = useCallback(async (resourceId: string) => {
    if (isCollected(resourceId)) {
      return removeInteraction({ type: 'collect', resourceId });
    } else {
      return addInteraction({ type: 'collect', resourceId });
    }
  }, [isCollected, addInteraction, removeInteraction]);

  const toggleSubscribe = useCallback(async (courseSetId: string) => {
    if (isSubscribed(courseSetId)) {
      return removeInteraction({ type: 'subscribe', courseSetId });
    } else {
      return addInteraction({ type: 'subscribe', courseSetId });
    }
  }, [isSubscribed, addInteraction, removeInteraction]);

  return {
    interactions,
    isLoading,
    addInteraction,
    removeInteraction,
    hasInteraction,
    isLiked,
    isCollected,
    isSubscribed,
    toggleLike,
    toggleCollect,
    toggleSubscribe
  };
}

// 用于管理用户进度的 hook
export function useProgress(courseId: string) {
  const { user } = useAuth();
  const [progressValue, setProgressValue] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      const userProgress = progressApi.getCourseProgress(user.id, courseId);
      if (userProgress) {
        setProgressValue(userProgress.progress);
        setIsCompleted(userProgress.completed);
      }
    }
  }, [user, courseId]);

  const updateProgress = useCallback(async (newProgress: number) => {
    if (!user) return;
    
    const result = progressApi.updateProgress(user.id, courseId, newProgress);
    
    if (result.success && result.data) {
      setProgressValue(result.data.progress);
      setIsCompleted(result.data.completed);
    }
  }, [user, courseId]);

  const markComplete = useCallback(async () => {
    await updateProgress(100);
  }, [updateProgress]);

  return {
    progress: progressValue,
    isCompleted,
    updateProgress,
    markComplete
  };
}

// 用于管理评估的 hook
export function useEvaluations() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const userEvaluations = evaluationsApi.getUserEvaluations(user.id);
      setEvaluations(userEvaluations);
    }
  }, [user]);

  const submitEvaluation = useCallback(async (url: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    try {
      const result = evaluationsApi.submitEvaluation(user.id, url);
      
      if (result.success) {
        const updatedEvaluations = evaluationsApi.getUserEvaluations(user.id);
        setEvaluations(updatedEvaluations);
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshEvaluations = useCallback(() => {
    if (user) {
      const userEvaluations = evaluationsApi.getUserEvaluations(user.id);
      setEvaluations(userEvaluations);
    }
  }, [user]);

  return {
    evaluations,
    isLoading,
    submitEvaluation,
    refreshEvaluations
  };
}

export default { useInteractions, useProgress, useEvaluations };