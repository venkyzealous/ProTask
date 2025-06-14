import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';

const initialColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

const initialTasks = [
    { id: 'task-1', title: 'Setup project repository', columnId: 'todo' },
    { id: 'task-2', title: 'Develop core components', columnId: 'todo' },
    { id: 'task-3', title: 'Implement drag and drop', columnId: 'inprogress' },
    { id: 'task-4', title: 'Refine UI/UX', columnId: 'inprogress' },
    { id: 'task-5', title: 'Add state persistence', columnId: 'done' },
];

export const useStore = create(persist((set, get) => ({
    // --- STATE ---
    columns: initialColumns,
    tasks: initialTasks,

    // --- CUSTOM GETTERS (for logging) ---
    getTasks: () => {
        console.log('%cSTATE ACCESSED: getTasks()', 'color: #888;');
        return get().tasks;
    },
    getColumns: () => {
        console.log('%cSTATE ACCESSED: getColumns()', 'color: #888;');
        return get().columns;
    },

    // --- CUSTOM SETTERS (Actions) ---
    addTask: (title, columnId) => {
        const caller = (new Error()).stack.split('\n')[2].trim().split(' ')[1];
        console.log(`%cACTION: addTask called by ${caller}`, 'color: green;', { title, columnId });
        set(state => ({
            tasks: [...state.tasks, { id: `task-${Date.now()}`, title, columnId }]
        }));
    },

    deleteTask: (taskId) => {
        const caller = (new Error()).stack.split('\n')[2].trim().split(' ')[1];
        console.log(`%cACTION: deleteTask called by ${caller}`, 'color: green;', { taskId });
        set(state => ({
            tasks: state.tasks.filter(task => task.id !== taskId)
        }));
    },

    moveTask: (active, over) => {
        const caller = (new Error()).stack.split('\n')[2].trim().split(' ')[1];
        console.log(`%cACTION: moveTask called by ${caller}`, 'color: green;', { active, over });

        set(prev => {
            const prevTasks = prev.tasks;
            const activeIndex = prevTasks.findIndex(t => t.id === active.id);
            const overIsAColumn = over.data.current?.type === 'Column';
            const overIsATask = over.data.current?.type === 'Task';

            let overIndex;
            let newColumnId;

            if (overIsATask) {
                overIndex = prevTasks.findIndex(t => t.id === over.id);
                if (overIndex === -1) return {}; // No change
                newColumnId = prevTasks[overIndex].columnId;
            } else if (overIsAColumn) {
                newColumnId = over.id;
                const tasksInNewColumn = prevTasks.filter(t => t.columnId === newColumnId);
                overIndex = tasksInNewColumn.length > 0 ? prevTasks.findIndex(t => t.id === tasksInNewColumn[tasksInNewColumn.length - 1].id) : -1;
                
                if (overIndex === -1) {
                    overIndex = prevTasks.length - 1;
                }
            } else {
                return {}; // No change
            }

            if (activeIndex === -1) return {};

            let newTasks = [...prevTasks];
            if (newTasks[activeIndex].columnId !== newColumnId) {
                newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: newColumnId };
            }
            
            const finalTasks = arrayMove(newTasks, activeIndex, overIndex);

            console.log('%cSTATE UPDATE (Tasks)', 'color: purple; font-weight: bold;', {
                before: prevTasks,
                after: finalTasks
            });

            return { tasks: finalTasks };
        });
    },

    moveColumn: (active, over) => {
        const caller = (new Error()).stack.split('\n')[2].trim().split(' ')[1];
        console.log(`%cACTION: moveColumn called by ${caller}`, 'color: green;', { active, over });

        set(prev => {
            const oldIndex = prev.columns.findIndex(c => c.id === active.id);
            const newIndex = prev.columns.findIndex(c => c.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return {}; // No change

            const finalColumns = arrayMove(prev.columns, oldIndex, newIndex);
            
            console.log('%cSTATE UPDATE (Columns)', 'color: purple; font-weight: bold;', { 
                before: prev.columns, 
                after: finalColumns
            });
            
            return { columns: finalColumns };
        });
    }

}), {
    name: 'protask-storage', // unique name for local storage
}));
