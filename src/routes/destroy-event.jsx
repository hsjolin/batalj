import { redirect } from "react-router-dom";
import { deleteEvent } from "../competition";

export async function action({ params }) {
    await deleteEvent(params.eventId);
    return redirect(`/${params.competitionId}`);
}   