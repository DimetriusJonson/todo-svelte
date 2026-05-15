import type { Task, TasksResponse } from "$lib/model/Task.svelte";
import type { ApiResponse } from "./ApiCommon.svelte";

export interface ApiTask {
    getList(params: any): Promise<ApiResponse<TasksResponse>>;
    get(params: any, id: number): Promise<ApiResponse<Task>>;
    delete(params: any, id: number): Promise<ApiResponse<boolean>>;
    update(params: any, patch: Task): Promise<ApiResponse<Task>>;
    create(params: any, task: Task): Promise<ApiResponse<Task>>;
}

//import { ApiTaskRemote } from "./ApiTaskRemote";
//export const apiTask = new ApiTaskRemote();

import { ApiTaskDb } from "./ApiTaskDb";
export const apiTask = new ApiTaskDb();

//import { ApiTaskNeonDb } from "./ApiTaskNeonDb";
//export const apiTask = new ApiTaskNeonDb();