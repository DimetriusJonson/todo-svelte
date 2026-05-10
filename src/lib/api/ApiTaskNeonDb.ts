import type { Task, TasksResponse } from "$lib/model/Task.svelte";
import { error, redirect } from "@sveltejs/kit";
import type { ApiTask } from "./ApiTask";
import type { ApiResponse } from "./ApiCommon.svelte";
import { getCurrentUser } from "./ApiUserNeonDb";
import sql from "$lib/server/neonDb";

export class ApiTaskNeonDb implements ApiTask {

    async get(params: any, id: number): Promise<ApiResponse<Task>> {
        let user = await getCurrentUser(params);
        if (!user) {
            return redirect(302, '/login');
        }

        const rows = await sql`SELECT * FROM tasks WHERE id = ${id} and user_id=${user.id}`;
        if (rows && rows.length > 0) {
            let row = rows[0];
            let task = {
                id: row.id,
                title: row.title,
                description: row.description,
                priority: row.priority,
                completed_at: row.completed_at.toISOString()
            } as Task;

            return { status: 200, success: true, responseData: task, error: null };
        } else {
            error(404, "Not found task id=" + id);
        }
    }

    async getList(params: any): Promise<ApiResponse<TasksResponse>> {
        let user = await getCurrentUser(params);
        if (!user) {
            return redirect(302, 'login');
        }

        const dbTasks: any[] = await sql`SELECT * FROM tasks WHERE deleted_at is null and user_id=${user.id}`;

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

        return { status: 200, success: true, responseData: { data: tasks }, error: null };
    }

    async update(params: any, patch: Task): Promise<ApiResponse<Task>> {
        let user = await getCurrentUser(params);
        if (!user) {
            return { status: 401, success: false, responseData: null, error: { message: 'Unauthorized', unAuthorized: true } };
        }

        try {
            await sql`UPDATE tasks 
                SET title=COALESCE(${patch.title}, title),
                    description=COALESCE(${patch.description}, description),
                    priority=COALESCE(${patch.priority}, priority),
                    completed_at=COALESCE(${patch.completed_at}, completed_at)
                where id = ${patch.id} and user_id=${user.id}`;
            return { success: true, status: 200, error: null, responseData: patch };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async create(params: any, task: Task): Promise<ApiResponse<Task>> {
        let user = await getCurrentUser(params);
        if (!user) {
            return { status: 401, success: false, responseData: null, error: { message: 'Unauthorized', unAuthorized: true } };
        }

        try {
            let completed_at = task.completed_at ? Date.parse(task.completed_at) : null;
            let rows = await sql`INSERT INTO tasks(title, description, priority, completed_at, user_id) VALUES(${task.title}, ${task.description}, ${task.priority}, ${completed_at}, ${user.id}) RETURNING id`;
            return { success: true, status: 200, error: null, responseData: { ...task, id: rows[0].id } };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async delete(params: any, id: number): Promise<ApiResponse<boolean>> {
        let user = await getCurrentUser(params);
        if (!user) {
            return { status: 401, success: false, responseData: false, error: { message: 'Unauthorized', unAuthorized: true } };
        }

        try {
            await sql`UPDATE tasks SET deleted_at=CURRENT_TIMESTAMP where id = ${id} and user_id=${user.id}`;
            return { success: true, status: 200, responseData: true, error: null };
        } catch (error: any) {
            return { success: false, status: 500, responseData: false, error: { message: error.toString() } }
        }
    }

}