import {
    redirect,
    Form,
    useLoaderData,
    useActionData
} from "react-router-dom";

import {
    closeWebsocketConnection
} from "../websocket";

import {
    getGroup,
    createGroup
} from "../api";

export async function loader() {
    closeWebsocketConnection();
    return { q: null, error: false };
}

export async function action({ request }) {
    const formData = await request.formData();
    const q = formData.get("q");
    if (q) {
        console.log(q);
        const group = await getGroup(q);
        if (group) {
            return redirect(`${group._id}`);
        }
    }

    if (formData.get("intent") === "create-new") {
        const group = await createGroup();
        return redirect(`${group._id}`);
    }

    return { q, error: true };
}

export default function Root() {
    const loaderData = useLoaderData()
    const actionData = useActionData();

    const { q, error } = Object.assign(loaderData, actionData);

    return (
        <>
            {error
                ? <p>Hittade ingen grupp med id {q} 🤷‍♂️</p>
                : " "
            }
            <div>
                <Form method="post">
                    <p>
                        <span>Grupp-ID</span>
                        <input
                            id="q"
                            aria-label="Ange ditt grupp-id"
                            placeholder="Ange ditt grupp-id"
                            type="search"
                            name="q"
                            defaultValue={q}
                        />
                    </p>
                </Form>
                <Form method="post">
                    <button name="intent" value="create-new">
                        Eller skapa en ny grupp 🎉
                    </button>
                </Form>
            </div>
        </>
    );
}
