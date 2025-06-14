import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { createPortal } from 'react-dom';

export function Board() {
    const columns = useStore(state => state.columns);
    const tasks = useStore(state => state.tasks);
    const moveTask = useStore(state => state.moveTask);
    const moveColumn = useStore(state => state.moveColumn);

    const columnIds = useMemo(() => columns.map(col => col.id), [columns]);
    const [activeElement, setActiveElement] = useState(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    }));

    function onDragStart(event) {
        if (event.active.data.current) {
            setActiveElement(event.active.data.current);
        }
    }

    function onDragEnd(event) {
        setActiveElement(null);
        const { active, over } = event;
        if (!over) return;

        const isActiveAColumn = active.data.current?.type === 'Column';
        const isActiveATask = active.data.current?.type === 'Task';

        if (isActiveAColumn && active.id !== over.id) {
            moveColumn(active, over);
        } else if (isActiveATask) {
            moveTask(active, over);
        }
    }
    
    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-8">ProTask Board</h1>
            <DndContext 
                sensors={sensors} 
                onDragStart={onDragStart} 
                onDragEnd={onDragEnd}
                collisionDetection={closestCorners}
            >
                <div className="flex gap-6 overflow-x-auto pb-4">
                    <SortableContext items={columnIds}>
                        {columns.map(col => <Column key={col.id} column={col} />)}
                    </SortableContext>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeElement?.type === 'Column' && <Column column={activeElement.column} />}
                        {activeElement?.type === 'Task' && <TaskCard task={activeElement.task} />}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}
