import { MIN_COMPLETED_AT, type Task } from "./model/Task.svelte";

export function priorityName(priority: string) {
    switch (priority) {
        case "C": return "Критический";
        case "H": return "Высокий";
        case "N": return "Нормальный";
        case "L": return "Низкий";
        default: return "";
    }
}

export function taskPriorityName(task: Task) {
    return priorityName(task.priority ?? '');
}

export function buildTaskCompletedAt(
    completed: boolean,
    completed_at: string,
): string {
    if (completed) {
        return (completed_at ?? MIN_COMPLETED_AT) === MIN_COMPLETED_AT || completed_at.length == 0
            ? new Date().toISOString()
            : completed_at;
    }
    return MIN_COMPLETED_AT;
}

export function filterTask(t: Task, filter: string | null) {
    switch (filter ?? "") {
        case "Completed":
            return t.completed;
        case "Uncompleted":
            return !t.completed;
        default:
            return true;
    }
}

export function sortTask(task1: Task, task2: Task, sortKind: string | null) {
    switch (sortKind ?? "") {
        case "Title":
            return (task1.title ?? "").localeCompare(
                task2.title ?? "",
            );
        case "Priority":
            return priorityName(task1.priority ?? "").localeCompare(
                priorityName(task2.priority ?? ""),
            );
        default:
            return (task1.id ?? 0) - (task2.id ?? 0);
    }
}