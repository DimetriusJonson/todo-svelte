export type Message = {
    id: string;
    msg: string;
    kind: string;
};

export function showInfo(msg: string) {
    const id = crypto.randomUUID();
    messages.push({ id: id, msg: msg, kind: "INFO" });

    setTimeout(() => {
        removeMessage(id);
    }, 5000);
}

export function showError(msg: string) {
    const id = crypto.randomUUID();
    messages.push({ id: id, msg: msg, kind: "ERROR" });

    setTimeout(() => {
        removeMessage(id);
    }, 30000);
}

export function removeMessage(id: string) {
    let index = messages.findIndex((m) => m.id === id);
    if (index >= 0) {
        messages.splice(index, 1);
    }
}

export let messages: Message[] = $state([]);