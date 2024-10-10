import { redirect } from "react-router-dom";
import { deleteContact } from "../api";

export async function action({ params }) {
    await deleteContact(params.contactId, params.groupId);
    return redirect(`/${params.competitionId}`);
}