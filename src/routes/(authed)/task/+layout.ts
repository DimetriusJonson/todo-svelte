import { priorityName } from "$lib/TaskHelper.svelte";
import type { PageServerLoad } from "./[id]/edit/$types";

export const load: PageServerLoad = async ({  }) => {
    let priorities = [
        priorityToOption("C"),
        priorityToOption("H"),
        priorityToOption("N"),
        priorityToOption("L"),
    ];

    return { priorities: priorities };
}

function priorityToOption(priority: string) {
    return { value: priority, text: priorityName(priority) };
}
