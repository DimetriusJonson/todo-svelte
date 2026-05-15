import { form, getRequestEvent } from "$app/server";
import { apiUser } from '$lib/api/ApiUser';
import { passwordValidateRegExp, userNameValidateRegExp, type CreateUserRequest } from '$lib/model/User.svelte';
import { redirect } from '@sveltejs/kit';
import * as v from "valibot";

const isUserNameExist = async (input: string) => {
    return await apiUser.getUserByName(input) === null;
};

const CreateUserServerSchema = v.objectAsync({
    userName: v.pipeAsync(
        v.string(),
        userNameValidateRegExp,
        v.checkAsync(isUserNameExist, "Пользователь уже существует."),
    ),
    password: v.pipe(
        v.string(),
        passwordValidateRegExp,
    ),
    redirectTo: v.pipe(v.string()),
});

export const createUser = form(CreateUserServerSchema, async ({userName, password, redirectTo}) => {
    const event = getRequestEvent();

    let result = await apiUser.create({ cookies: event.cookies }, { username: userName, password: password } as CreateUserRequest);
    if (result.success) {
        redirect(303, redirectTo + userName );
    } else {
        return { error: result.error };
    }
});
