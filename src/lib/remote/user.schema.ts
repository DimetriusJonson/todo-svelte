import * as v from "valibot";

export const userNameValidateRegExp = v.regex(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, 'Начинается с буквы, за которой следуют буквы, цифры или подчеркивания.');
export const passwordValidateRegExp = v.regex(/^.{4,}$/, "Минимум 4 символов.");

export const CreateUserSchema = v.object({
    userName: v.pipe(
        v.string(),
        userNameValidateRegExp,
    ),
    password: v.pipe(
        v.string(),
        passwordValidateRegExp,
    ),
});

