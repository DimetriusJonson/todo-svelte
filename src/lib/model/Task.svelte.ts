export const MIN_COMPLETED_AT = '1900-01-01T00:00:00.000Z';

export type TasksResponse = {
    data: Task[],
}

export type Task = {
    id?: number | null;
    priority?: string | null;
    title?: string | null;
    completed_at?: string | null;
    completed?: boolean | null;
    description?: string | null;
    deleted_at?: string | null;
    is_default?: boolean | null;

}

export function isTaskCompleted(completed_at: string | null | undefined): boolean {
    return (completed_at ?? MIN_COMPLETED_AT) !== MIN_COMPLETED_AT && (completed_at ?? '').length > 0;
}

export function taskFromJson(jsonData: any): Task {
    let task = {...jsonData};

    task.completed = isTaskCompleted(task.completed_at);
    return task;
}

