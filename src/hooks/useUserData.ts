import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import type { UserInteraction, Evaluation } from '../types';

interface UseInteractionsResult {
  interactions: UserInteraction[];
  isLoading: boolean;
  isSubscribed: (courseSetId: string) => boolean;
  isLiked: (resourceId: string) => boolean;
  isCollected: (resourceId: string) => boolean;
  toggleSubscribe: (courseSetId: string) => Promise<{ success: boolean; error?: string }>;
  toggleLike: (resourceId: string) => Promise<{ success: boolean; error?: string }>;
  toggleCollect: (resourceId: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useInteractions(): UseInteractionsResult {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      setInteractions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching interactions:', error);
        setInteractions([]);
      } else {
        setInteractions((data || []).map(i => ({
          id: i.id,
          userId: i.user_id,
          type: i.type as 'like' | 'collect' | 'subscribe' | 'view',
          resourceId: i.resource_id,
          skillId: i.skill_id,
          courseSetId: i.course_set_id,
          timestamp: i.created_at
        })));
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setInteractions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const isSubscribed = useCallback((courseSetId: string): boolean => {
    return interactions.some(i => i.type === 'subscribe' && i.courseSetId === courseSetId);
  }, [interactions]);

  const isLiked = useCallback((resourceId: string): boolean => {
    return interactions.some(i => i.type === 'like' && i.resourceId === resourceId);
  }, [interactions]);

  const isCollected = useCallback((resourceId: string): boolean => {
    return interactions.some(i => i.type === 'collect' && i.resourceId === resourceId);
  }, [interactions]);

  const toggleSubscribe = useCallback(async (courseSetId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '请先登录' };
    }

    const existing = interactions.find(i => i.type === 'subscribe' && i.courseSetId === courseSetId);

    if (existing?.id) {
      const { error } = await supabase
        .from('user_interactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          type: 'subscribe',
          course_set_id: courseSetId
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    await fetchInteractions();
    return { success: true };
  }, [user, interactions, fetchInteractions]);

  const toggleLike = useCallback(async (resourceId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '请先登录' };
    }

    const existing = interactions.find(i => i.type === 'like' && i.resourceId === resourceId);

    if (existing?.id) {
      const { error } = await supabase
        .from('user_interactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          type: 'like',
          resource_id: resourceId
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    await fetchInteractions();
    return { success: true };
  }, [user, interactions, fetchInteractions]);

  const toggleCollect = useCallback(async (resourceId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '请先登录' };
    }

    const existing = interactions.find(i => i.type === 'collect' && i.resourceId === resourceId);

    if (existing?.id) {
      const { error } = await supabase
        .from('user_interactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          type: 'collect',
          resource_id: resourceId
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    await fetchInteractions();
    return { success: true };
  }, [user, interactions, fetchInteractions]);

  return {
    interactions,
    isLoading,
    isSubscribed,
    isLiked,
    isCollected,
    toggleSubscribe,
    toggleLike,
    toggleCollect,
    refetch: fetchInteractions
  };
}

interface UseCompletedCoursesResult {
  completedCourseSets: string[];
  isLoading: boolean;
  toggleComplete: (courseSetId: string) => Promise<{ success: boolean; error?: string }>;
  isCompleted: (courseSetId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useCompletedCourses(): UseCompletedCoursesResult {
  const { user } = useAuth();
  const [completedCourseSets, setCompletedCourseSets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompleted = useCallback(async () => {
    if (!user) {
      setCompletedCourseSets([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('course_set_id')
        .eq('user_id', user.id)
        .eq('type', 'complete');

      if (error) {
        console.error('Error fetching completed courses:', error);
        setCompletedCourseSets([]);
      } else {
        setCompletedCourseSets((data || []).map(i => i.course_set_id).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching completed courses:', err);
      setCompletedCourseSets([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  const isCompleted = useCallback((courseSetId: string): boolean => {
    return completedCourseSets.includes(courseSetId);
  }, [completedCourseSets]);

  const toggleComplete = useCallback(async (courseSetId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '请先登录' };
    }

    const existing = completedCourseSets.includes(courseSetId);

    if (existing) {
      const { error } = await supabase
        .from('user_interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('type', 'complete')
        .eq('course_set_id', courseSetId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          type: 'complete',
          course_set_id: courseSetId
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    await fetchCompleted();
    return { success: true };
  }, [user, completedCourseSets, fetchCompleted]);

  return {
    completedCourseSets,
    isLoading,
    toggleComplete,
    isCompleted,
    refetch: fetchCompleted
  };
}

interface UseEvaluationsResult {
  evaluations: Evaluation[];
  isLoading: boolean;
  submitEvaluation: (url: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useEvaluations(): UseEvaluationsResult {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvaluations = useCallback(async () => {
    if (!user) {
      setEvaluations([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching evaluations:', error);
        setEvaluations([]);
      } else {
        setEvaluations((data || []).map(e => ({
          id: e.id,
          url: e.url,
          repositoryName: e.repositoryName || e.url,
          status: e.status as 'pending' | 'completed' | 'failed',
          submittedAt: e.submittedAt || e.created_at,
          result: e.result
        })));
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setEvaluations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const submitEvaluation = useCallback(async (url: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '请先登录' };
    }

    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    const repositoryName = match ? match[1] : url;

    const { error } = await supabase
      .from('evaluations')
      .insert({
        user_id: user.id,
        url,
        repositoryName,
        status: 'pending'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    await fetchEvaluations();
    return { success: true };
  }, [user, fetchEvaluations]);

  return {
    evaluations,
    isLoading,
    submitEvaluation,
    refetch: fetchEvaluations
  };
}

export default { useInteractions, useCompletedCourses, useEvaluations };
