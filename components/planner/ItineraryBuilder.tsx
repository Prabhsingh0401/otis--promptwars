'use client';
// components/planner/ItineraryBuilder.tsx
// dnd-kit drag-and-drop itinerary reordering

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { GripVertical, Clock, DollarSign } from 'lucide-react';
import type { Day, Activity } from '@/types';
import { ACTIVITY_CATEGORY_META } from '@/types';

interface ItineraryBuilderProps {
  days:     Day[];
  onUpdate: (days: Day[]) => void;
}

export default function ItineraryBuilder({ days, onUpdate }: ItineraryBuilderProps) {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveActivity(null);
    if (!over || active.id === over.id) return;

    const newDays = days.map((d) => ({ ...d, activities: [...d.activities] }));
    let sourceDayIdx = -1, sourceActIdx = -1;
    let destDayIdx   = -1, destActIdx   = -1;

    newDays.forEach((day, di) => {
      day.activities.forEach((act, ai) => {
        if (act.id === active.id) { sourceDayIdx = di; sourceActIdx = ai; }
        if (act.id === over.id)   { destDayIdx   = di; destActIdx   = ai; }
      });
    });

    if (sourceDayIdx === -1) return;

    if (sourceDayIdx === destDayIdx) {
      newDays[sourceDayIdx].activities = arrayMove(
        newDays[sourceDayIdx].activities,
        sourceActIdx,
        destActIdx,
      );
    } else if (destDayIdx !== -1) {
      const [moved] = newDays[sourceDayIdx].activities.splice(sourceActIdx, 1);
      newDays[destDayIdx].activities.splice(destActIdx, 0, moved);
    }

    onUpdate(newDays);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => {
        const id = String(e.active.id);
        const act = days.flatMap((d) => d.activities).find((a) => a.id === id);
        setActiveActivity(act ?? null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 pb-32" role="list" aria-label="Itinerary days">
        {days.map((day, idx) => (
          <DaySection key={day.id} day={day} dayNumber={idx + 1} />
        ))}
      </div>

      <DragOverlay>
        {activeActivity && <ActivityCardOverlay activity={activeActivity} />}
      </DragOverlay>
    </DndContext>
  );
}

function DaySection({ day, dayNumber }: { day: Day; dayNumber: number }) {
  const date = new Date(day.date + 'T00:00:00');
  const label = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const total = day.activities.reduce((s, a) => s + a.estimatedCost, 0);

  return (
    <section className="animate-card-in" role="listitem" aria-label={`Day ${dayNumber}: ${label}`}>
      {/* Premium day header */}
      <div className="flex items-end justify-between mb-4 px-2">
        <div className="space-y-0.5">
          <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em]">Day {dayNumber}</p>
          <h3 className="text-xl font-black text-label-primary tracking-tight">{label}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-tighter">Est. Spend</p>
          <p className="text-sm font-black text-label-primary">${total}</p>
        </div>
      </div>

      {/* Activity list */}
      <div className="bg-bg-tertiary border border-separator rounded-card overflow-hidden shadow-sm">
        <SortableContext
          items={day.activities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {day.activities.length > 0 ? (
            day.activities.map((activity, i) => (
              <SortableActivityRow
                key={activity.id}
                activity={activity}
                isLast={i === day.activities.length - 1}
              />
            ))
          ) : (
            <div className="p-8 text-center text-label-quaternary border-2 border-dashed border-separator/50 m-4 rounded-xl">
              <p className="text-sm font-bold italic">No activities planned for this day</p>
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
}

function SortableActivityRow({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast:   boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const meta = ACTIVITY_CATEGORY_META[activity.category];

  const style: React.CSSProperties = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
    zIndex:     isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-6 px-6 py-6 bg-bg-tertiary group',
        !isLast ? 'border-b border-separator' : '',
        'active:bg-fill-primary transition-all duration-300',
      ].join(' ')}
      role="listitem"
      aria-label={`${activity.title} at ${activity.timeWindow.start}`}
    >
      {/* Category icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300"
        style={{ background: meta.bg }}
        aria-hidden="true"
      >
        <span className="text-xl" role="img" aria-label={meta.label}>
          {getCategoryEmoji(activity.category)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[10px] font-black text-accent uppercase tracking-widest">{activity.category}</span>
           <span className="text-label-quaternary text-[10px]">•</span>
           <span className="text-[10px] font-bold text-label-secondary uppercase tracking-wider">{activity.timeWindow.start}</span>
        </div>
        <p className="text-lg font-black text-label-primary truncate tracking-tight group-hover:text-accent transition-colors">
          {activity.title}
        </p>
        <p className="text-[13px] text-label-secondary line-clamp-1 mt-1 font-medium opacity-80">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      {/* Price + Drag Handle */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-tighter">Cost</p>
          <p className="text-sm font-black text-label-primary">${activity.estimatedCost}</p>
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center text-label-quaternary hover:text-label-primary hover:bg-fill-secondary cursor-grab active:cursor-grabbing rounded-full transition-all"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>
      </div>
    </div>
  );
}

function ActivityCardOverlay({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-bg-elevated rounded-card shadow-2xl border border-white/20 backdrop-blur-xl">
      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
        <span className="text-lg">{getCategoryEmoji(activity.category)}</span>
      </div>
      <div>
        <p className="text-sm font-black text-label-primary tracking-tight">{activity.title}</p>
        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{activity.category}</p>
      </div>
    </div>
  );
}

function getCategoryEmoji(category: Activity['category']): string {
  const map: Record<Activity['category'], string> = {
    attraction:    '🏛',
    restaurant:    '🍽',
    transport:     '🚗',
    accommodation: '🏨',
    experience:    '✨',
  };
  return map[category];
}
