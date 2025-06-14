import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CgTrash } from 'react-icons/cg';
import { useStore } from '../store';

export function TaskCard({ task }) {
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        transition,
        isDragging // This boolean tells us if the item is being dragged
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task: task,
        },
    });

    const deleteTask = useStore(state => state.deleteTask);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Add a class for the dragging state
    const draggingClasses = isDragging 
        ? 'ring-2 ring-blue-500 opacity-80 shadow-2xl' 
        : 'hover:border-slate-500 hover:shadow-lg';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-slate-700 p-4 rounded-md shadow-md border border-slate-600 cursor-grab active:cursor-grabbing flex justify-between items-center transition-all ${draggingClasses}`}
        >
            <p className="text-gray-200 break-words">{task.title}</p>
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag from starting when clicking delete
                    deleteTask(task.id);
                }} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full flex-shrink-0"
            >
                <CgTrash size={18} />
            </button>
        </div>
    );
}
