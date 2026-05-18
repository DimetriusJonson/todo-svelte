import type { User } from "$lib/model/User.svelte";
import { hashPassword } from "$lib/server/crypt";
import sql from "$lib/server/db";

export async function findUserByName(name: string, withPassword: boolean): Promise<User | null> {
    let rows = await sql`SELECT * FROM users WHERE upper(username)=${name.toUpperCase()} and deleted_at is null`;
    if (rows && rows.length > 0) {
        let result = { id: rows[0].id, name: rows[0].username } as User;
        if (withPassword) {
            result.password = rows[0].password;
        }
        return result;
    }

    return null;
}

export async function findAllUsers(): Promise<User[]> {
    const dbUsers: any[] = await sql`SELECT * FROM users WHERE deleted_at is null`;

    let users: User[] = [];
    dbUsers.forEach(dbUser => {
        let user = {
            id: dbUser.id,
            name: dbUser.username
        } as User;
        users.push(user);
    });

    return users;
}

export async function dbInsertUser(user: User): Promise<User> {
    let hashedPassword = await hashPassword(user.password ?? '');
    let rows = await sql`INSERT INTO users(username, password) VALUES(${user.name}, ${hashedPassword}) RETURNING id`;
    return { ...user, id: rows[0].id};
}

export async function dbUpdateUserToken(userId: number, token: string | null): Promise<boolean> {
    let result = await sql`UPDATE users SET token=${token} WHERE id=${userId}`;
    return result.count > 0;
}
