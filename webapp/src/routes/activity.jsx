import {
  Form,
  useLoaderData,
  useParams,
  useRevalidator
} from "react-router-dom";

import {
  getActivity,
  updateActivity,
  getContacts,
  getScores,
  updateScore,
  createScore,
  getContact
} from "../api";
import { useEffect, useState } from "react";
import { addWebsocketListener, removeWebsocketListener } from "../websocket";

export async function loader({ params }) {
  // Fetch activity, contacts, and scores from API
  const [activity, contacts, scores] = await Promise.all([
    getActivity(params.groupSlug, params.competitionId, params.activityId),
    getContacts(params.groupSlug),
    getScores(params.groupSlug, params.competitionId, params.activityId)
  ]);

  if (!activity || !contacts) {
    throw new Response("Aktiviteten hittades inte", {
      status: 404,
      statusText: "Aktiviteten hittades inte"
    });
  }

  document.title = `${window.documentTitle}: ${activity.name}`;
  const contactsWithScore = contacts.map(contact => {
    const score = scores.find(score => score.contactId === contact._id);
    return {
      ...contact,
      score: score?.score,
      result: score?.result,
      time1: score?.time1,
      time2: score?.time2,
      scoreId: score?._id
    };
  });

  console.log(contactsWithScore);
  return { activity, contactsWithScore };
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const scoreId = formData.get("scoreId");
  const contactId = formData.get("contactId");

  switch (intent) {
    case "submit-score":
      const result = formData.get("result");
      const time1 = formData.get("time1");
      const time2 = formData.get("time2");
      return await submitScore(
        result ? parseFloat(result) : null,
        time1 ? parseFloat(time1) : null,
        time2 ? parseFloat(time2) : null,
        scoreId,
        contactId,
        params
      );
    case "update-activity":
      return await updateActivity(params, { name: formData.get("name") });
  }
}

export default function Activity() {
  const { activity, contactsWithScore } = useLoaderData();
  const params = useParams();
  const revalidator = useRevalidator();

  useEffect(() => {
    // Revalidate when switching activities
    revalidator.revalidate();

    const listenerRef = addWebsocketListener(params.groupSlug,
      async evnt => {
        if (evnt.type === "message" && (
          evnt.message === "score" ||
          evnt.message === "activity")
        ) {
          revalidator.revalidate();
        }
      }
    );

    return () => {
      removeWebsocketListener(listenerRef);
    };
  }, [params.activityId]);

  return (
    <div id="activity">
      <div>
        <h1>
          {activity.name ? (
            <>
              {activity.name}
            </>
          ) : (
            <i>Aktivitet utan namn</i>
          )}{" "}
        </h1>

        {activity.notes && <p>{activity.notes}</p>}

        <p><em>Typ: {getActivityTypeLabel(activity.activityType)}</em></p>

        {contactsWithScore
          ? <ContactList contacts={contactsWithScore} activityType={activity.activityType} />
          : (" ")}

        <div>
          <Form action="edit">
            <button type="submit">Redigera</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(e) => {
              if (!confirm(`Vill du verkligen ta bort aktiviten ${activity.name ?? ""}`)) {
                e.preventDefault();
              }
            }}>
            <button type="submit">Ta bort</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

async function submitScore(result, time1, time2, scoreId, contactId, param) {
  const params = { ...param, ...{ scoreId, contactId } };
  const data = {};

  if (result !== null) data.result = result;
  if (time1 !== null) data.time1 = time1;
  if (time2 !== null) data.time2 = time2;
  data.contactId = contactId;

  if (!scoreId) {
    const score = await createScore(params, data);
    return score;
  }

  return await updateScore(params, data);
}

function getActivityTypeLabel(activityType) {
  switch (activityType) {
    case "TIME_LONG_BETTER":
      return "Tid (längre är bättre)";
    case "TIME_SHORT_BETTER":
      return "Tid (kortare är bättre)";
    case "TIME_MATCHING":
      return "Tidsmatchning";
    case "POINTS_HIGH_BETTER":
      return "Poäng (högre är bättre)";
    case "POINTS_LOW_BETTER":
      return "Poäng (lägre är bättre)";
    default:
      return activityType;
  }
}

function ContactList({ contacts, activityType }) {
  return (
    <div>
      <ul>
        {contacts.map(contact => {
          return (
            <li key={contact._id} >
              <ContactResult contact={contact} activityType={activityType} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactResult({ contact, activityType }) {
  const score = contact.score ?? 0;
  const [result, setResult] = useState(contact.result ?? "");
  const [time1, setTime1] = useState(contact.time1 ?? "");
  const [time2, setTime2] = useState(contact.time2 ?? "");

  // Update state when contact data changes (e.g., when switching activities)
  useEffect(() => {
    setResult(contact.result ?? "");
    setTime1(contact.time1 ?? "");
    setTime2(contact.time2 ?? "");
  }, [contact.result, contact.time1, contact.time2]);

  const isTimeMatching = activityType === "TIME_MATCHING";

  return (
    <>
      <p>
        <b>{contact.first}{contact.last ? ` ${contact.last}` : ""}</b> {score} p
      </p>
      <Form method="post">
        {isTimeMatching ? (
          <>
            <p>
              Tid 1: <input
                name="time1"
                type="number"
                step="0.01"
                value={time1}
                onChange={(e) => setTime1(e.target.value)}
                placeholder="Sekunder"
              />
            </p>
            <p>
              Tid 2: <input
                name="time2"
                type="number"
                step="0.01"
                value={time2}
                onChange={(e) => setTime2(e.target.value)}
                placeholder="Sekunder"
              />
            </p>
          </>
        ) : (
          <p>
            Resultat: <input
              name="result"
              type="number"
              step="0.01"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </p>
        )}
        <input type="hidden" value={contact._id} name="contactId" />
        <input type="hidden" value={contact.scoreId} name="scoreId" />
        <button type="submit" name="intent" value="submit-score">Spara</button>
      </Form>
    </>);
}
