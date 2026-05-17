import type { Task, TasksResponse } from "$lib/model/Task.svelte";
import { error } from "@sveltejs/kit";
import type { ApiTask } from "./../ApiTask";
import sql from "$lib/server/neonDb";
import type { ApiResponse } from "../apiTypes";

export class ApiTaskNeonDb implements ApiTask {

    async getTaskByTitle(input: string, ignoreId: number, params: any): Promise<Task | null> {
        if (!params.user) {
            return null;
        }

        const rows = await sql`SELECT * FROM tasks WHERE upper(title) = ${input.toUpperCase()} and user_id=${params.user.id} and deleted_at is null and id != ${ignoreId}`;
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

    async get(params: any, id: number): Promise<ApiResponse<Task>> {
        const rows = await sql`SELECT * FROM tasks WHERE id = ${id} and user_id=${params.user.id}`;
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
            error(404, `Задача ${1} не найдена!`);
        }
    }

    async getList(params: any): Promise<ApiResponse<TasksResponse>> {
        const dbTasks: any[] = await sql`SELECT * FROM tasks WHERE deleted_at is null and user_id=${params.user.id}`;

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

    async validate<T>(title: string | null | undefined, userId: number | null, create: boolean): Promise<ApiResponse<T> | null> {
        let errorsMap = new Map();

        let regExp = new RegExp('^[А-Яа-яA-Za-z0-9 ]{3,}$');
        if (!regExp.test(title ?? '')) {
            errorsMap.set('title', 'Разрешены только буквы и цифры и не менее 3-х символов.');
        }

        if (create) {
            let rows = await sql`SELECT id FROM tasks WHERE upper(title)=${title?.toUpperCase() ?? null} and user_id=${userId} and deleted_at is null`;
            if (rows && rows.length > 0) {
                errorsMap.set('title', 'Задача с таким именем уже существует!');
            }
        }

        if (errorsMap.size > 0) {
            return { success: false, status: 422, responseData: null, error: { message: 'Validate error', validateErrors: errorsMap } }
        }

        return null;
    }


    async update(params: any, patch: Task): Promise<ApiResponse<Task>> {
        if (!params.user) {
            return { status: 401, success: false, responseData: null, error: { message: 'Unauthorized', unAuthorized: true } };
        }

        if (patch.title) {
            let validateErrors = await this.validate<Task>(patch.title, params.user.id, false);
            if (validateErrors) {
                return validateErrors;
            }
        }

        try {
            await sql`UPDATE tasks 
                SET title=COALESCE(${patch.title ?? null}, title),
                    description=COALESCE(${patch.description ?? null}, description),
                    priority=COALESCE(${patch.priority ?? null}, priority),
                    completed_at=COALESCE(${patch.completed_at ?? null}, completed_at)
                where id = ${patch.id ?? null} and user_id=${params.user.id}`;
            return { success: true, status: 200, error: null, responseData: patch };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async create(params: any, task: Task): Promise<ApiResponse<Task>> {
        if (!params.user) {
            return { status: 401, success: false, responseData: null, error: { message: 'Unauthorized', unAuthorized: true } };
        }

        let validateErrors = await this.validate<Task>(task.title, params.user.id, true);
        if (validateErrors) {
            return validateErrors;
        }

        try {
            let rows = await sql`INSERT INTO tasks(title, description, priority, completed_at, user_id) 
                VALUES(${task.title ?? null}, ${task.description ?? null}, ${task.priority ?? null}, ${task.completed_at ?? null}, ${params.user.id}) RETURNING id`;
            return { success: true, status: 200, error: null, responseData: { ...task, id: rows[0].id } };
        } catch (error: any) {
            return { success: false, status: 500, responseData: null, error: { message: error.toString() } }
        }
    }

    async delete(params: any, id: number): Promise<ApiResponse<boolean>> {
        if (!params.user) {
            return { status: 401, success: false, responseData: false, error: { message: 'Unauthorized', unAuthorized: true } };
        }

        try {
            await sql`UPDATE tasks SET deleted_at=CURRENT_TIMESTAMP where id = ${id} and user_id=${params.user.id}`;
            return { success: true, status: 200, responseData: true, error: null };
        } catch (error: any) {
            return { success: false, status: 500, responseData: false, error: { message: error.toString() } }
        }
    }

}