import { redirect } from "react-router-dom";
import { deleteActivity } from "../api";

export async function action({ params }) {
    await deleteActivity(params.activityId);
    return redirect(`/group/${params.groupSlug}/competitions/${params.competitionId}`);
}
