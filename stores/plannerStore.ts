// stores/plannerStore.ts
// Zustand store for local UI state — itinerary builder, active trip, UI panels

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Trip, Day, Activity, GenerateItineraryInput } from '@/types';

interface PlannerState {
  // Current trip being built/viewed
  activeTripId:   string | null;
  draftTrip:      Trip | null;
  isGenerating:   boolean;
  generationProgress: number;  // 0–100
  generationStatus:   string;

  // Form state for trip planning
  plannerInput: Partial<GenerateItineraryInput>;

  // UI state
  selectedActivityId: string | null;
  isSheetOpen:        boolean;
  activeTab:          'explore' | 'plan' | 'trips' | 'profile';

  // Actions
  setActiveTripId:     (id: string | null) => void;
  setDraftTrip:        (trip: Trip | null) => void;
  setIsGenerating:     (v: boolean) => void;
  setGenerationProgress: (v: number) => void;
  setGenerationStatus: (s: string) => void;
  updatePlannerInput:  (partial: Partial<GenerateItineraryInput>) => void;
  setSelectedActivity: (id: string | null) => void;
  setSheetOpen:        (v: boolean) => void;
  setActiveTab:        (tab: PlannerState['activeTab']) => void;
  reorderActivities:   (dayId: string, activities: Activity[]) => void;
  moveActivityBetweenDays: (
    fromDayId:   string,
    toDayId:     string,
    activityId:  string,
    targetIndex: number,
  ) => void;
  resetPlanner: () => void;
}

const DEFAULT_PLANNER_INPUT: Partial<GenerateItineraryInput> = {
  preferences: {
    budget:              'moderate',
    travelStyle:         ['cultural'],
    dietaryRestrictions: [],
    mobility:            'full',
    preferredTransport:  ['walking', 'transit'],
  },
  numberOfTravelers: 2,
  budget:            2500,
};

export const usePlannerStore = create<PlannerState>()(
  devtools(
    (set) => ({
      activeTripId:        null,
      draftTrip:           null,
      isGenerating:        false,
      generationProgress:  0,
      generationStatus:    '',
      plannerInput:        DEFAULT_PLANNER_INPUT,
      selectedActivityId:  null,
      isSheetOpen:         false,
      activeTab:           'explore',

      setActiveTripId:     (id) => set({ activeTripId: id }),
      setDraftTrip:        (trip) => set({ draftTrip: trip }),
      setIsGenerating:     (v) => set({ isGenerating: v }),
      setGenerationProgress: (v) => set({ generationProgress: v }),
      setGenerationStatus: (s) => set({ generationStatus: s }),
      updatePlannerInput:  (partial) =>
        set((state) => ({ plannerInput: { ...state.plannerInput, ...partial } })),
      setSelectedActivity: (id) => set({ selectedActivityId: id }),
      setSheetOpen:        (v) => set({ isSheetOpen: v }),
      setActiveTab:        (tab) => set({ activeTab: tab }),

      reorderActivities: (dayId, activities) =>
        set((state) => {
          if (!state.draftTrip) return state;
          const days = state.draftTrip.days.map((d) =>
            d.id === dayId ? { ...d, activities } : d,
          );
          return { draftTrip: { ...state.draftTrip, days } };
        }),

      moveActivityBetweenDays: (fromDayId, toDayId, activityId, targetIndex) =>
        set((state) => {
          if (!state.draftTrip) return state;
          const days = [...state.draftTrip.days];
          const fromDay = days.find((d) => d.id === fromDayId);
          const toDay   = days.find((d) => d.id === toDayId);
          if (!fromDay || !toDay) return state;

          const actIndex = fromDay.activities.findIndex((a) => a.id === activityId);
          if (actIndex === -1) return state;

          const [moved] = fromDay.activities.splice(actIndex, 1);
          toDay.activities.splice(targetIndex, 0, moved);

          return { draftTrip: { ...state.draftTrip, days } };
        }),

      resetPlanner: () =>
        set({
          draftTrip:          null,
          isGenerating:       false,
          generationProgress: 0,
          generationStatus:   '',
          plannerInput:       DEFAULT_PLANNER_INPUT,
          selectedActivityId: null,
        }),
    }),
    { name: 'planner-store' },
  ),
);
