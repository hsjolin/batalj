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
    getActivities,
    createActivity,
    getContacts,
    getCompetition,
    getGroup
} from "../api";

export async function loader({ request, params }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const activities = await getActivities(params.competitionId, q);
    const contacts = await getContacts(params.groupSlug);
    const competition = await getCompetition(params.competitionId);
    const group = await getGroup(params.groupSlug);

    return { activities, contacts, competition, group };
}

export async function action({ request, params }) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    switch (intent) {
        case "create-activity":
            const activity = await createActivity(params);
            return redirect(`activities/${activity._id}/edit`);
    }
}

export default function Competition() {
    const { activities, contacts, competition, group } = useLoaderData();
    const navigation = useNavigation();
    const params = useParams();

    return (
        <>
            <div id="sidebar">
                <div>
                    <p><NavLink to={`/group/${params.groupSlug}`}>&lt; {group.name}</NavLink></p>
                    <h2>{competition.name}</h2>
                    <NavLink to="statistics">Tävlingsstatistik</NavLink>
                </div>
                <nav>
                    {activities.length ? (
                        <ul>
                            {activities.map(activity => (
                                <li key={activity._id}>
                                    <NavLink
                                        to={`activities/${activity._id}`}
                                        className={({ isActive, isPending }) =>
                                            isActive
                                                ? "active"
                                                : isPending
                                                    ? "pending"
                                                    : ""}>
                                        {activity.name
                                            ? <>{activity.name}</>
                                            : <i>Aktivitet utan namn</i>}{" "}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            Inga aktiviteter
                        </p>
                    )}
                </nav>
                <div>
                    <Form method="post">
                        <button type="submit" name="intent" value="create-activity">Ny aktivitet</button>
                    </Form>
                </div>
            </div>
            <div id="detail" className={navigation.state === "loading" ? "loading" : ""}>
                <Outlet />
            </div>
        </>
    );
}
