import { getRequestEvent } from "$app/server";
import { apiTask } from "$lib/api/ApiTask";
import * as v from "valibot";

const titleRegExp = v.regex(/^[А-Яа-яA-Za-z0-9 ]{3,}$/, 'Разрешены только буквы и цифры и не менее 3-х символов.');

const isTaskExist = async (input: string) => {
    let event = getRequestEvent();
    return await apiTask.getTaskByTitle(input, parseInt(event.params.id ?? '0'), { cookies: getRequestEvent().cookies }) === null
};

export const TaskServerSchema = v.objectAsync({
    id: v.pipe(
        v.string(),
    ),
    title: v.pipeAsync(
        v.string(),
        titleRegExp,
        v.checkAsync(isTaskExist, 'Задача уже существует.')
    ),
    priority: v.pipe(
        v.string(),
        v.nonEmpty('Обязательно для заполнения.'),
    ),
    oldCompleted_at: v.pipe(
        v.string()
    ),
    completed: v.pipe(
        v.optional(v.boolean())
    ),
    description: v.pipe(
        v.string()
    )
});