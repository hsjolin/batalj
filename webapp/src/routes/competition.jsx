import {
    Outlet,
    Form,
    NavLink,
    redirect,
    useLoaderData,
    useNavigation,
    useSubmit,
    useParams
} from "react-router-dom";

import { useEffect } from "react";

import {
    getEvents,
    createEvent,
    getContacts,
    getCompetition,
    getGroup
} from "../api";

export async function loader({ request, params }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const events = await getEvents(params.competitionId, q);
    const contacts = await getContacts(params.groupId);
    const competition = await getCompetition(params.competitionId);
    const group = await getGroup(params.groupId);

    return { events, contacts, competition, group };
}

export async function action({ request, params }) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    switch (intent) {
        case "create-event":
            const event = await createEvent(params);
            return redirect(`events/${event._id}/edit`);
    }
}

export default function Competition() {
    const { events, contacts, competition, group } = useLoaderData();
    const navigation = useNavigation();
    const params = useParams();

    return (
        <>
            <div id="sidebar">
                <div>
                    <p><NavLink to={`/${params.groupId}`}>&lt; {group.name}</NavLink></p>
                </div>
                <nav>
                    {events.length ? (
                        <ul>
                            {events.map(event => (
                                <li key={event._id}>
                                    <NavLink
                                        to={`events/${event._id}`}
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
                            Inga aktiviteter 🤷‍♂️
                        </p>
                    )}
                </nav>
                <div>
                    <Form method="post">
                        <button type="submit" name="intent" value="create-event">Ny aktivitet</button>
                    </Form>
                </div>
            </div>
            <div id="detail" className={navigation.state === "loading" ? "loading" : ""}>
                <Outlet />
            </div>
        </>
    );
}
