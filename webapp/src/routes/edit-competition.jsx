import {
    Form,
    useLoaderData,
    redirect,
    useNavigate
} from "react-router-dom";
import {
    updateCompetition,
    getCompetition
} from "../api";

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    await updateCompetition(params.competitionId, params.groupId, updates);

    return redirect(`/${params.groupId}`);
}

export async function loader({ params }) {
    const competition = await getCompetition(params.competitionId);
    if(competition) {
        return { competition };
    }

    throw Error(`Competition with id ${params.competitionId} was not found`);
}

export default function EditCompetition() {
    const { competition } = useLoaderData();
    const navigate = useNavigate();

    return (
        <Form method="post" id="competition-form">
            <p>
                <span>Name</span>
                <input
                    placeholder="Name"
                    aria-label="Name"
                    type="text"
                    name="name"
                    defaultValue={competition?.name}
                />
            </p>
            <label>
                <span>Notes</span>
                <textarea
                    name="notes"
                    defaultValue={competition?.notes}
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
