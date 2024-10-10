import {
    Outlet,
    Form,
    NavLink,
    redirect,
    useLoaderData,
    useNavigation,
    useParams
} from "react-router-dom";

import {
    openWebsocketConnection,
    onWebsocketEvent
} from "../websocket";

import { useEffect, useState } from "react";

import {
    getCompetitions,
    createCompetition,
    createContact,
    getContacts
} from "../api";

export async function loader({ request, params }) {
    const url = new URL(request.url);
    const contacts = await getContacts(params.groupId);
    const competitions = await getCompetitions(params.groupId);
    return { contacts, competitions };
}

export async function action(q) {
    const request = q.request;
    const params = q.params;

    const formData = await request.formData();
    const intent = formData.get("intent");
    switch (intent) {
        case "create-contact":
            const contact = await createContact(params.groupId);
            return redirect(`contacts/${contact._id}/edit`);
        case "create-competition":
            const competition = await createCompetition(params.groupId);
            return redirect(`competitions/${competition._id}/edit`);
    }
}

export default function Group() {
    let { competitions, contacts } = useLoaderData();
    const navigation = useNavigation();
    const params = useParams();

    const [data, setContacts] = useState(contacts);
    useEffect(() => {
        onWebsocketEvent(async evnt => {
            if (evnt.type === "message" && evnt.message === "contact") {
                setContacts(await getContacts(params.groupId));
            }
        });

        openWebsocketConnection(params.groupId);
    }, []);

    if (data) {
        contacts = data;
    }

    return (
        <>
            <div id="sidebar">
                <nav>
                    {competitions.length ? (
                        <ul>
                            {competitions.map(competition => (
                                <li key={competition._id}>
                                    <NavLink
                                        to={`competitions/${competition._id}`}
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
                                <li key={contact._id}>
                                    <NavLink
                                        to={`contacts/${contact._id}`}
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