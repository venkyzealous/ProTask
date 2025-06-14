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
    // --- State Access: Selectors read from the store ---
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
        console.group('%cSEQUENCE: onDragStart', 'font-weight: bold; color: blue;');
        console.log('Event:', event);
        console.groupEnd();

        if (event.active.data.current) {
            setActiveElement(event.active.data.current);
        }
    }

    // --- Best Practice: All logic is in onDragEnd for stability ---
    function onDragEnd(event) {
        setActiveElement(null);
        const { active, over } = event;
        
        console.group('%cSEQUENCE: onDragEnd', 'font-weight: bold; color: red;');
        if (!over) {
            console.log('Drag ended but not over a valid target. No action taken.');
            console.groupEnd();
            return;
        }
        
        console.log("Active Element:", active);
        console.log("Over Element:", over);

        const isActiveAColumn = active.data.current?.type === 'Column';
        const isActiveATask = active.data.current?.type === 'Task';

        // --- Best Practice: Event handler dispatches actions to the store ---
        if (isActiveAColumn && active.id !== over.id) {
            console.log('Dispatching moveColumn action...');
            moveColumn(active, over);
        } else if (isActiveATask) {
            console.log('Dispatching moveTask action...');
            moveTask(active, over);
        }

        console.groupEnd();
    }
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">ProTask Board</h1>
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
