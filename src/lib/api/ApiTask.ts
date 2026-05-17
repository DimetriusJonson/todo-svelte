import type { Task } from "$lib/model/Task.svelte";
import { ApiTaskDb } from "./ApiTaskDb";

export interface ApiTask {
    getList(params: any): Promise<Task[]>;
    get(params: any, id: number): Promise<Task>;
    delete(params: any, id: number): Promise<boolean>;
    update(params: any, patch: Task): Promise<Task>;
    create(params: any, task: Task): Promise<Task>;
    getTaskByTitle(input: string, ignoreId: number, params: any): Promise<Task | null>;
}

export const apiTask = new ApiTaskDb();