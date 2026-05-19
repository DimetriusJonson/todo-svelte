import * as v from "valibot";

const titleRegExp = v.regex(/^[А-Яа-яA-Za-z0-9 ]{3,}$/, 'Разрешены только буквы и цифры и не менее 3-х символов.');

export const TaskSchema = v.object({
    id: v.pipe(
        v.string(),
    ),
    title: v.pipe(
        v.string(),
        titleRegExp,
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

