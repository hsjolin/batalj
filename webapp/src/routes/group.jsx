import {
    Outlet,
    Form,
    NavLink,
    redirect,
    useLoaderData,
    useNavigation,
    useParams,
    useRevalidator
} from "react-router-dom";

import {
    addWebsocketListener,
    removeWebsocketListener
} from "../websocket";

import { useEffect } from "react";

import {
    getCompetitions,
    createCompetition,
    createContact,
    getContacts
} from "../api";

export async function loader({ request, params }) {
    console.log("Grouprouter");
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
    const navigation = useNavigation();
    const params = useParams();
    
    const { contacts, competitions } = useLoaderData();
    console.log("Group", contacts.length);
    
    const revalidator = useRevalidator();
    useEffect(() => {
        const listenerRef = addWebsocketListener(params.groupId,
            async evnt => {
                if (evnt.type === "message" && (
                    evnt.message === "contact" ||
                    evnt.message === "competition")
                ) {
                    revalidator.revalidate();
                }
            }
        );

        return () => {
            removeWebsocketListener(listenerRef);
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
                            Inga tävlingar 🤷‍♂️
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
                            Inga kontakter 🤷‍♂️
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