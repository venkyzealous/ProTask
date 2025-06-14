import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CgTrash } from 'react-icons/cg';
import { useStore } from '../store';

export function TaskCard({ task }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: task.id,
        // THIS IS THE CRITICAL FIX: We must wrap the task's info in a `data` object
        // so the drag-and-drop context knows what it is.
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing flex justify-between items-center"
        >
            <p className="text-gray-800">{task.title}</p>
            <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500">
                <CgTrash size={18} />
            </button>
        </div>
    );
}
