import {
    Form,
    useLoaderData,
    redirect,
    useNavigate
} from "react-router-dom";
import { updateActivity } from "../api";

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    await updateActivity(params, updates);

    return redirect(`/group/${params.groupSlug}/competitions/${params.competitionId}/activities/${params.activityId}`);
}

export default function EditActivity() {
    const { activity } = useLoaderData();
    const navigate = useNavigate();

    return (
        <Form method="post" id="activity-form">
            <p>
                <span>Namn</span>
                <input
                    placeholder="Namn"
                    aria-label="Namn"
                    type="text"
                    name="name"
                    defaultValue={activity?.name}
                />
            </p>
            <p>
                <span>Aktivitetstyp</span>
                <select name="activityType" defaultValue={activity?.activityType}>
                    <option value="TIME_LONG_BETTER">Tid (längre är bättre)</option>
                    <option value="TIME_SHORT_BETTER">Tid (kortare är bättre)</option>
                    <option value="TIME_MATCHING">Tidsmatchning</option>
                    <option value="POINTS_HIGH_BETTER">Poäng (högre är bättre)</option>
                    <option value="POINTS_LOW_BETTER">Poäng (lägre är bättre)</option>
                </select>
            </p>
            <label>
                <span>Beskrivning</span>
                <textarea
                    name="notes"
                    defaultValue={activity?.notes}
                    rows={6}
                />
            </label>
            <p>
                <button type="submit">Spara</button>
                <button type="button" onClick={() => navigate(-1)}>Avbryt</button>
            </p>
        </Form>
    );
}
