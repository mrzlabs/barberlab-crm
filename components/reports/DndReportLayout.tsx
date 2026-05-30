"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const STORAGE_KEY = "barberlab:report-order";

type Module = { id: string; label: string; node: React.ReactNode };

function SortableModule({ id, label, node }: Module) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
    >
      <div className="group relative">
        {/* drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-8 top-1/2 hidden -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-lg p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing lg:flex"
          type="button"
          aria-label={`Arrastrar módulo ${label}`}
        >
          <GripVertical className="size-4" />
        </button>
        {node}
      </div>
    </div>
  );
}

export function DndReportLayout({ modules }: { modules: Module[] }) {
  const [order, setOrder] = useState<string[]>(() => modules.map((m) => m.id));

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        const valid = parsed.filter((id) => modules.some((m) => m.id === id));
        const missing = modules.map((m) => m.id).filter((id) => !valid.includes(id));
        setOrder([...valid, ...missing]);
      }
    } catch {
      // ignore corrupt localStorage
    }
  }, [modules]);

  const saveOrder = useCallback((next: string[]) => {
    setOrder(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = order.indexOf(String(active.id));
      const newIdx = order.indexOf(String(over.id));
      saveOrder(arrayMove(order, oldIdx, newIdx));
    }
  }

  const sorted = order
    .map((id) => modules.find((m) => m.id === id))
    .filter(Boolean) as Module[];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-6 pl-8">
          {sorted.map((m) => (
            <SortableModule key={m.id} {...m} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
