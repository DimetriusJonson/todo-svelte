import type { Task } from "$lib/model/Task.svelte";
import { error } from "@sveltejs/kit";
import sql from "$lib/server/db";

export async function findTaskByTitle(input: string, ignoreId: number, userId: number): Promise<Task | null> {
    const rows = await sql`SELECT * FROM tasks WHERE upper(title) = ${input.toUpperCase()} and user_id=${userId} and deleted_at is null and id != ${ignoreId}`;
    if (rows && rows.length > 0) {
        let row = rows[0];
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            priority: row.priority,
            completed_at: row.completed_at
        } as Task;
    }

    return null;
}

export async function findTaskById(id: number, userId: number): Promise<Task> {
    const rows = await sql`SELECT * FROM tasks WHERE id = ${id} and user_id=${userId}`;
    if (rows && rows.length > 0) {
        let row = rows[0];
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            priority: row.priority,
            completed_at: row.completed_at.toISOString()
        } as Task;
    } else {
        error(404, `Задача ${1} не найдена!`);
    }
}

export async function findTasks(userId: number): Promise<Task[]> {
    const dbTasks: any[] = await sql`SELECT * FROM tasks WHERE deleted_at is null and user_id=${userId ?? null}`;

    let tasks: Task[] = [];
    dbTasks.forEach(dbTask => {
        let task = {
            id: dbTask.id,
            title: dbTask.title,
            description: dbTask.description,
            priority: dbTask.priority,
            completed_at:
                dbTask.completed_at.toISOString()
        } as Task;
        tasks.push(task);
    });

    return tasks;
}

export async function dbUpdateTask(patch: Task, userId: number): Promise<Task> {
    await sql`UPDATE tasks 
                SET title=COALESCE(${patch.title ?? null}, title),
                    description=COALESCE(${patch.description ?? null}, description),
                    priority=COALESCE(${patch.priority ?? null}, priority),
                    completed_at=COALESCE(${patch.completed_at ?? null}, completed_at)
                where id = ${patch.id ?? null} and user_id=${userId}`;
    return patch;
}

export async function dbInsertTask(task: Task, userId: number): Promise<Task> {
    let rows = await sql`INSERT INTO tasks(title, description, priority, completed_at, user_id) 
                VALUES(${task.title ?? null}, ${task.description ?? null}, ${task.priority ?? null}, ${task.completed_at ?? null}, ${userId}) RETURNING id`;
    return { ...task, id: rows[0].id };
}

export async function dbDeleteTask(id: number, userId: number): Promise<boolean> {
    await sql`UPDATE tasks SET deleted_at=CURRENT_TIMESTAMP where id = ${id} and user_id=${userId}`;
    return true;
}

