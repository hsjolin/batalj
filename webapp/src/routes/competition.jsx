import {
    Outlet,
    Form,
    NavLink,
    redirect,
    useLoaderData,
    useNavigation,
    useSubmit
} from "react-router-dom";

import { useEffect } from "react";

import {
    getEvents,
    createEvent,
    createContact,
    getContacts
} from "../api";

export async function loader({ request, params }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const events = await getEvents(params.competitionId, q);
    const contacts = await getContacts(params.groupId);
    return { events, contacts, q };
}

export async function action(q) {
    const request = q.request;
    const params = q.params;

    console.log(q);

    const formData = await request.formData();
    const intent = formData.get("intent");
    switch (intent) {
        case "create-contact":
            const contact = await createContact(params.groupId);
            return redirect(`contacts/${contact.id}/edit`);
        case "create-event":
            const event = await createEvent(params.competitionId);
            return redirect(`events/${event.id}/edit`);
    }
}

export default function Competition() {
    const { events, q, contacts } = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching = navigation.location
        && new URLSearchParams(navigation.location.search).has("q");

    useEffect(() => {
        document.getElementById("q").value = q;
    }, [q]);

    return (
        <>
            <div id="sidebar">
                <div>
                    <Form id="search-form" role="search">
                        <input
                            id="q"
                            className={searching
                                ? "loading"
                                : ""}
                            aria-label="Search contacts"
                            placeholder="Search"
                            type="search"
                            name="q"
                            defaultValue={q}
                            onChange={e => {
                                const isFirstSearch = q == null;
                                submit(e.currentTarget.form, {
                                    replace: !isFirstSearch
                                });
                            }}
                        />
                        <div
                            id="search-spinner"
                            aria-hidden
                            hidden={!searching}
                        />
                        <div
                            className="sr-only"
                            aria-live="polite">
                        </div>
                    </Form>
                </div>
                <nav>
                    {events.length ? (
                        <ul>
                            {events.map(event => (
                                <li key={event.id}>
                                    <NavLink
                                        to={`events/${event.id}`}
                                        className={({ isActive, isPending }) =>
                                            isActive
                                                ? "active"
                                                : isPending
                                                    ? "pending"
                                                    : ""}>
                                        {event.name
                                            ? <>{event.name}</>
                                            : <i>Aktivitet utan namn</i>}{" "}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            <i>Inga aktiviteter 🤷‍♂️</i>
                        </p>
                    )}
                </nav>
                <div>
                    <Form method="post">
                        <button type="submit" name="intent" value="create-event">Ny aktivitet</button>
                    </Form>
                </div>
            </div>
            <div
                id="detail"
                className={navigation.state === "loading" ? "loading" : ""}>
                <Outlet />
            </div>
        </>
    );
}
