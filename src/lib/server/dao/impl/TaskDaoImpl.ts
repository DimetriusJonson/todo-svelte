import type { Task } from "$lib/model/Task.svelte";
import { error } from "@sveltejs/kit";
import sql from "$lib/server/db";
import type { TaskDao } from "../TaskDao";

export class TaskDaoImpl implements TaskDao {

    async getTaskByTitle(input: string, ignoreId: number, params: any): Promise<Task | null> {
        const rows = await sql`SELECT * FROM tasks WHERE upper(title) = ${input.toUpperCase()} and user_id=${params.user?.id ?? null} and deleted_at is null and id != ${ignoreId}`;
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

    async get(params: any, id: number): Promise<Task> {
        const rows = await sql`SELECT * FROM tasks WHERE id = ${id} and user_id=${params.user?.id ?? null}`;
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

    async getList(params: any): Promise<Task[]> {
        const dbTasks: any[] = await sql`SELECT * FROM tasks WHERE deleted_at is null and user_id=${params.user?.id ?? null}`;

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

    async update(params: any, patch: Task): Promise<Task> {
        await sql`UPDATE tasks 
                SET title=COALESCE(${patch.title ?? null}, title),
                    description=COALESCE(${patch.description ?? null}, description),
                    priority=COALESCE(${patch.priority ?? null}, priority),
                    completed_at=COALESCE(${patch.completed_at ?? null}, completed_at)
                where id = ${patch.id ?? null} and user_id=${params.user?.id ?? null}`;
        return patch;
    }

    async create(params: any, task: Task): Promise<Task> {
        let rows = await sql`INSERT INTO tasks(title, description, priority, completed_at, user_id) 
                VALUES(${task.title ?? null}, ${task.description ?? null}, ${task.priority ?? null}, ${task.completed_at ?? null}, ${params.user?.id ?? null}) RETURNING id`;
        return { ...task, id: rows[0].id };
    }

    async delete(params: any, id: number): Promise<boolean> {
        await sql`UPDATE tasks SET deleted_at=CURRENT_TIMESTAMP where id = ${id} and user_id=${params.user?.id ?? null}`;
        return true;
    }

}