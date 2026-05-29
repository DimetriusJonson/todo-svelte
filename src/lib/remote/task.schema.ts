import * as v from "valibot";

export const TaskSchema = v.object({
    id: v.pipe(
        v.string(),
    ),
    title: v.pipe(
        v.string(),
        v.minLength(3, 'Должно быть не менее 3-х символов.'),
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

