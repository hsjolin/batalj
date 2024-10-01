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
    getCompetitions,
    createCompetition,
    createContact,
    getContacts
} from "../api";

export async function loader({ request, params }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(params.groupId, q);
    const competitions = await getCompetitions(params.groupId);
    return { contacts, competitions, q };
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
        case "create-competition":
            const competition = await createCompetition(params.groupId);
            return redirect(`competitions/${competition.id}/edit`);
    }
}

export default function Group() {
    const { competitions, q, contacts } = useLoaderData();
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
                    {competitions.length ? (
                        <ul>
                            {competitions.map(competition => (
                                <li key={competition.id}>
                                    <NavLink
                                        to={`competitions/${competition.id}`}
                                        className={({ isActive, isPending }) =>
                                            isActive
                                                ? "active"
                                                : isPending
                                                    ? "pending"
                                                    : ""}>
                                        {competition.name
                                            ? <>{competition.name}</>
                                            : <i>Tävling utan namn</i>}{" "}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            <i>Inga tävlingar 🤷‍♂️</i>
                        </p>
                    )}
                </nav>
                <div>
                    <Form method="post">
                        <button type="submit" name="intent" value="create-competition">Ny tävling</button>
                    </Form>
                </div>
                <nav>
                    {contacts.length ? (
                        <ul>
                            {contacts.map(contact => (
                                <li key={contact.id}>
                                    <NavLink
                                        to={`contacts/${contact.id}`}
                                        className={({ isActive, isPending }) =>
                                            isActive
                                                ? "active"
                                                : isPending
                                                    ? "pending"
                                                    : ""}>
                                        {contact.first && contact.last
                                            ? <>{contact.first} {contact.last}</>
                                            : contact.first
                                                ? <>{contact.first}</>
                                                : contact.last
                                                    ? <>{contact.last}</>
                                                    : <i>Kontakt utan namn</i>}{" "}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            <i>Inga kontakter 🤷‍♂️</i>
                        </p>
                    )}
                </nav>
                <div>
                    <Form method="post">
                        <button type="submit" name="intent" value="create-contact">Ny kontakt</button>
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
