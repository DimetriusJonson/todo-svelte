import type { Task, TasksResponse } from "$lib/model/Task.svelte";
import { error, redirect } from "@sveltejs/kit";
import type { ApiTask } from "./ApiTask";
import type { ApiResponse } from "./ApiCommon.svelte";
import { getCurrentUser } from "./ApiUserDb";
import db from "$lib/server/db";

const GET_TASK_SQL = db.prepare("SELECT * FROM tasks WHERE id = ? and user_id=?");

const GET_TASKS_SQL = db.prepare("SELECT * FROM tasks WHERE deleted_at is null and user_id=?");

const UPDATE_TASK_SQL = db.prepare(
    "UPDATE tasks " +
    "SET title=COALESCE(@title, title), " +
    "    description=COALESCE(@description, description), " +
    "    priority=COALESCE(@priority, priority), " +
    "    completed_at=COALESCE(@completed_at, completed_at) " +
    "where id = @id and user_id=@userId");

const INSERT_TASK_SQL = db.prepare(
    "INSERT INTO tasks(title, description, priority, completed_at, user_id) VALUES(@title, @description, @priority, @completed_at, @userId) RETURNING id");

const DELETE_TASK_SQL = db.prepare(
    "UPDATE tasks " +
    "SET deleted_at=CURRENT_TIMESTAMP " +
    "where id = @id and user_id=@userId");

export class ApiTaskDb implements ApiTask {

    async get(params: any, id: number): Promise<ApiResponse<Task>> {
        let user = await getCurrentUser(params);
        if (!user) {
            return redirect(302, '/login');
        }

        const row: any = GET_TASK_SQL.get(id, user.id);
        if (row) {
            let task = {
                id: row.id,
                title: row.title,
                description: row.description,
                priority: row.priority,
                completed_at: row.completed_at
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

        const dbTasks: any[] = GET_TASKS_SQL.all(user.id);

        let tasks: Task[] = [];
        dbTasks.forEach(dbTask => {
            let task = {
                id: dbTask.id,
                title: dbTask.title,
                description: dbTask.description,
                priority: dbTask.priority,
                completed_at:
                    dbTask.completed_at
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
            let updateInfo = UPDATE_TASK_SQL.run({ id: patch.id, title: patch.title, description: patch.description, priority: patch.priority, completed_at: patch.completed_at, userId: user.id });
            if (updateInfo.changes > 0) {
                return { success: true, status: 200, error: null, responseData: patch };
            } else {
                return { success: false, status: 404, responseData: null, error: { message: 'Not found task.id=' + patch.id } }
            }
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
            let row: any = INSERT_TASK_SQL.get({ id: task.id, title: task.title, description: task.description, priority: task.priority, completed_at: task.completed_at, userId: user.id });
            return { success: true, status: 200, error: null, responseData: { ...task, id: row.id } };
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
            let deleteInfo = DELETE_TASK_SQL.run({id: id, userId: user.id});
            if (deleteInfo.changes > 0) {
                return { success: true, status: 200, responseData: true, error: null };
            } else {
                return { success: false, status: 404, responseData: false, error: { message: 'Not found task.id=' + id } }
            }
        } catch (error: any) {
            return { success: false, status: 500, responseData: false, error: { message: error.toString() } }
        }
    }

}