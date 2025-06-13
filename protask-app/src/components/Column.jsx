import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import { TaskCard } from './TaskCard';
import { useStore } from '../store';
import { CgAdd } from 'react-icons/cg';

export function Column({ column }) {
    const tasks = useStore(state => state.tasks);
    const addTask = useStore(state => state.addTask);
    const columnTasks = useMemo(() => tasks.filter(task => task.columnId === column.id), [tasks, column.id]);
    const taskIds = useMemo(() => columnTasks.map(task => task.id), [columnTasks]);

    const [newTaskTitle, setNewTaskTitle] = useState('');

    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
        id: column.id,
        data: { type: 'Column', column }
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            addTask(newTaskTitle, column.id);
            setNewTaskTitle('');
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0 flex flex-col">
            <div
                {...attributes}
                {...listeners}
                className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-gray-300 cursor-grab active:cursor-grabbing"
            >
                {column.title}
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
                <SortableContext items={taskIds}>
                    {columnTasks.map(task => <TaskCard key={task.id} task={task} />)}
                </SortableContext>
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add new task..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleAddTask} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    <CgAdd size={20} />
                </button>
            </div>
        </div>
    );
}