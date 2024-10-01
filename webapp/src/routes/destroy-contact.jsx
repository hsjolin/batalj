import { redirect } from "react-router-dom";
import { deleteContact } from "../api";

export async function action({ params }) {
    await deleteContact(params.contactId);
    return redirect(`/${params.competitionId}`);
}