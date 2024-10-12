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
    onWebsocketEvent,
    closeWebsocketConnection
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
    const initialContacts = await getContacts(params.groupId);
    const initialCompetitions = await getCompetitions(params.groupId);
    return { initialContacts, initialCompetitions };
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
    const navigation = useNavigation();
    const params = useParams();

    const { initialContacts, initialCompetitions } = useLoaderData();
    const [contacts, setContacts] = useState(initialContacts);
    const [competitions, setCompetitions] = useState(initialCompetitions);

    useEffect(() => {
        openWebsocketConnection(params.groupId);
        onWebsocketEvent(async evnt => {
            if (evnt.type === "message" && evnt.message === "contact") {
                setContacts(await getContacts(params.groupId));
            }

            if (evnt.type === "message" && evnt.message === "competition") {
                setCompetitions(await getCompetitions(params.groupId));
            }
        });

        return () => {
            closeWebsocketConnection();
        };
    }, []);

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