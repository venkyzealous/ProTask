import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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


export const useStore = create(persist((set) => ({
    columns: initialColumns,
    tasks: initialTasks,

    addTask: (title, columnId) => set((state) => ({
        tasks: [...state.tasks, { id: `task-${Date.now()}`, title, columnId }]
    })),

    deleteTask: (taskId) => set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId)
    })),

    setTasks: (newTasks) => set({ tasks: newTasks }),

    setColumns: (newColumns) => set({ columns: newColumns }),

}), {
    name: 'protask-storage', // unique name for local storage
}));