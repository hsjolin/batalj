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

import { useEffect, useState } from "react";

import {
    createCompetition,
    createContact,
    getGroup,
    getContacts,
    getCompetitions,
    switchContact,
    sendInvite,
    getCurrentUser
} from "../api";

export async function loader({ request, params }) {
    console.log("Grouprouter");

    // Fetch directly from API to ensure fresh data
    const [group, currentUser, contacts, competitions] = await Promise.all([
        getGroup(params.groupSlug),
        getCurrentUser(),
        getContacts(params.groupSlug),
        getCompetitions(params.groupSlug)
    ]);

    return { contacts, competitions, group, currentUser };
}

export async function action(q) {
    const request = q.request;
    const params = q.params;

    const formData = await request.formData();
    const intent = formData.get("intent");
    switch (intent) {
        case "create-contact":
            const contact = await createContact(params.groupSlug);
            return redirect(`contacts/${contact._id}/edit`);
        case "create-competition":
            const competition = await createCompetition(params.groupSlug);
            return redirect(`competitions/${competition._id}/edit`);
        case "switch-contact":
            const contactId = formData.get("contactId");
            await switchContact(contactId);
            return redirect(`/group/${params.groupSlug}`);
        case "send-invite":
            const email = formData.get("email");
            await sendInvite(params.groupSlug, email);
            return { inviteSent: true };
    }
}

export default function Group() {
    const navigation = useNavigation();
    const params = useParams();

    const { contacts, competitions, group, currentUser } = useLoaderData();

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteSent, setInviteSent] = useState(false);

    const revalidator = useRevalidator();
    useEffect(() => {
        const listenerRef = addWebsocketListener(params.groupSlug,
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

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await sendInvite(params.groupSlug, inviteEmail);
            setInviteSent(true);
            setTimeout(() => {
                setShowInviteModal(false);
                setInviteEmail("");
                setInviteSent(false);
            }, 2000);
        } catch (error) {
            alert("Kunde inte skicka inbjudan");
        }
    };

    return (
        <>
            <div id="sidebar">
                <div id="group-header">
                    <h2>{group.name}</h2>
                    <div id="user-controls">
                        <select
                            value={currentUser?.contactId || ""}
                            onChange={(e) => {
                                const form = new FormData();
                                form.append("intent", "switch-contact");
                                form.append("contactId", e.target.value);
                                fetch(window.location.pathname, {
                                    method: "POST",
                                    body: form,
                                    credentials: "include"
                                }).then(() => revalidator.revalidate());
                            }}>
                            {contacts.map(contact => (
                                <option key={contact._id} value={contact._id}>
                                    {contact.first && contact.last
                                        ? `${contact.first} ${contact.last}`
                                        : contact.first || contact.last || "Namnlös"}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => setShowInviteModal(true)}>Bjud in</button>
                        <NavLink to="statistics">Statistik</NavLink>
                    </div>
                </div>

                {showInviteModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Bjud in via e-post</h3>
                            {inviteSent ? (
                                <p>Inbjudan skickad!</p>
                            ) : (
                                <form onSubmit={handleInvite}>
                                    <input
                                        type="email"
                                        placeholder="E-postadress"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                    <div>
                                        <button type="submit">Skicka</button>
                                        <button type="button" onClick={() => setShowInviteModal(false)}>Avbryt</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

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