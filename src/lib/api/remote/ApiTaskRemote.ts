import type { Task, TasksResponse } from "$lib/model/Task.svelte";
import { fetchData, makeRequest, type ApiResponse } from "./ApiCommon.svelte";
import type { ApiTask } from "./ApiTask";

export class ApiTaskRemote implements ApiTask {
    async getTaskByTitle(input: string, ignoreId: number, params: any): Promise<Task | null> {
        return null;
    }

    async delete(params: any, id: number): Promise<ApiResponse<boolean>> {
        return makeRequest<boolean>('/tasks/' + id, 'DELETE', null, params.cookies);
    }

    async get(params: any, id: number): Promise<ApiResponse<Task>> {
        return fetchData<Task>(params.parent, params.fetch, '/tasks/' + id);
    }
    async create(params: any, task: Task): Promise<ApiResponse<Task>> {
        return makeRequest<Task>('/tasks', 'POST', task, params.cookies);
    }
    async update(params: any, patch: Task): Promise<ApiResponse<Task>> {
        return makeRequest<Task>('/tasks/' + patch.id, 'PATCH', patch, params.cookies);
    }

    async getList(params: any): Promise<ApiResponse<TasksResponse>> {
        return fetchData<TasksResponse>(params.parent, params.fetch, "/tasks");
    }

}