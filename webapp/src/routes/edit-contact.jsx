import {
    Form,
    useLoaderData,
    redirect,
    useNavigate
} from "react-router-dom";
import { updateContact } from "../api";

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    updates.avatar = updates.avatar 
        ? updates.avatar
        : `https://robohash.org/${params.contactId}.png?size=200x200`;

    await updateContact(
        params.contactId,
        params.groupId,
        updates);

    return redirect(`/${params.groupId}/contacts/${params.contactId}`);
}

export default function EditContact() {
    const { contact } = useLoaderData();
    const navigate = useNavigate();

    return (
        <Form method="post" id="contact-form">
            <p>
                <span>Name</span>
                <input
                    placeholder="First"
                    aria-label="First name"
                    type="text"
                    name="first"
                    defaultValue={contact?.first}
                />
                <input
                    placeholder="Last"
                    aria-label="Last name"
                    type="text"
                    name="last"
                    defaultValue={contact?.last}
                />
            </p>
            <label>
                <span>Avatar URL</span>
                <input
                    placeholder="https://example.com/avatar.jpg"
                    aria-label="Avatar URL"
                    type="text"
                    name="avatar"
                    defaultValue={contact?.avatar}
                />
            </label>
            <label>
                <span>Notes</span>
                <textarea
                    name="notes"        
                    defaultValue={contact?.notes}
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
