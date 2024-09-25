import {
    Form,
    useLoaderData,
    redirect,
    useNavigate
} from "react-router-dom";
import { updateEvent } from "../competition";

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    await updateEvent(params.eventId, updates);

    return redirect(`/events/${params.eventId}`);
}

export default function EditEvent() {
    const { event } = useLoaderData();
    const navigate = useNavigate();

    return (
        <Form method="post" id="contact-form">
            <p>
                <span>Name</span>
                <input
                    placeholder="Namn"
                    aria-label="Namn"
                    type="text"
                    name="name"
                    defaultValue={event?.name}
                />
            </p>
            <label>
                <span>Beskrivning</span>
                <textarea
                    name="notes"        
                    defaultValue={event?.notes}
                    rows={6}
                />
            </label>
            <p>
                <button type="submit">Save</button>
                <button type="button" onClick={() => navigate(-1)}>Cancel</button>
            </p>
        </Form>
    );
}
