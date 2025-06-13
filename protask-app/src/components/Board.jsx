// src/components/Board.jsx

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { createPortal } from 'react-dom';

export function Board() {
    const columns = useStore(state => state.columns);
    const tasks = useStore(state => state.tasks);
    const setColumns = useStore(state => state.setColumns);
    const setTasks = useStore(state => state.setTasks);
    const columnIds = useMemo(() => columns.map(col => col.id), [columns]);

    const [activeElement, setActiveElement] = useState(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // 5px of movement before activation
        },
    }));

    function onDragStart(event) {
        if (event.active.data.current) {
            setActiveElement(event.active.data.current);
        }
    }

    function onDragOver(event) {
        const { active, over } = event;
        if (!over) return;
    
        const activeId = active.id;
        const overId = over.id;
    
        if (activeId === overId) return;
    
        const isActiveATask = active.data.current?.type === 'Task';
        const isOverATask = over.data.current?.type === 'Task';
    
        if (!isActiveATask) return;
    
        // Logic for dropping a task over another task (to reorder)
        if (isActiveATask && isOverATask) {
            setTasks(prevTasks => {
                const activeIndex = prevTasks.findIndex(t => t.id === activeId);
                const overIndex = prevTasks.findIndex(t => t.id === overId);

                // If tasks are in different columns, update the columnId of the active task
                if (prevTasks[activeIndex].columnId !== prevTasks[overIndex].columnId) {
                    prevTasks[activeIndex].columnId = prevTasks[overIndex].columnId;
                    return arrayMove(prevTasks, activeIndex, overIndex);
                }
                // If tasks are in the same column, just reorder
                return arrayMove(prevTasks, activeIndex, overIndex);
            });
        }
    
        // Logic for dropping a task into a column
        const isOverAColumn = over.data.current?.type === 'Column';
        if (isActiveATask && isOverAColumn) {
            setTasks(prevTasks => {
                const activeIndex = prevTasks.findIndex(t => t.id === activeId);
                // Update the columnId of the active task
                prevTasks[activeIndex].columnId = overId;
                // We just need to update the columnId, the reordering happens in onDragEnd
                // By returning a new array from arrayMove, we trigger a re-render
                return arrayMove(prevTasks, activeIndex, activeIndex);
            });
        }
    }

    function onDragEnd(event) {
        setActiveElement(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const isColumnDrag = active.data.current?.type === 'Column';
        if (isColumnDrag) {
            const oldIndex = columns.findIndex(col => col.id === active.id);
            const newIndex = columns.findIndex(col => col.id === over.id);
            if (oldIndex !== newIndex) {
                setColumns(arrayMove(columns, oldIndex, newIndex));
            }
            return;
        }

        const oldIndex = tasks.findIndex(t => t.id === active.id);
        const newIndex = tasks.findIndex(t => t.id === over.id);

        if (oldIndex !== newIndex) {
            setTasks(arrayMove(tasks, oldIndex, newIndex));
        }
    }
    
    // Add type to the data object for easier identification
    const getTaskById = (id) => tasks.find(task => task.id === id);
    const getColumnById = (id) => columns.find(col => col.id === id);


    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">ProTask Board</h1>
            <DndContext 
                sensors={sensors} 
                onDragStart={onDragStart} 
                onDragOver={onDragOver} 
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
                        {activeElement?.type === 'Column' && <Column column={getColumnById(activeElement.id)} />}
                        {activeElement?.type === 'Task' && <TaskCard task={getTaskById(activeElement.id)} />}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}

// You need to update the data passed to useSortable in Column.jsx and TaskCard.jsx