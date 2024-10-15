import {
  Form,
  useLoaderData,
  useParams,
  useRevalidator
} from "react-router-dom";

import {
  getEvent,
  updateEvent,
  getContacts,
  getScores,
  updateScore,
  createScore,
  getContact
} from "../api";
import { useEffect, useState } from "react";
import { addWebsocketListener, removeWebsocketListener } from "../websocket";

export async function loader({ params }) {
  const event = await getEvent(params.eventId);
  const contacts = await getContacts(params.groupId);
  const scores = await getScores(params.eventId) ?? [];

  if (!event || !contacts) {
    throw new Response("Aktiviteten hittades inte", {
      status: 404,
      statusText: "Aktiviteten hittades inte"
    });
  }

  document.title = `${window.documentTitle}: ${event.name}`;
  const contactsWithScore = contacts.map(contact => {
    const score = scores.find(score => score.contactId === contact._id);
    return {
      ...contact,
      score: score?.score,
      result: score?.result,
      scoreId: score?._id
    };
  });

  console.log(contactsWithScore);
  return { event, contactsWithScore };
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const result = formData.get("result");
  const scoreId = formData.get("scoreId");
  const contactId = formData.get("contactId");
  const contact = await getContact(contactId);

  switch (intent) {
    case "submit-score":
      return await submitScore(parseInt(result), scoreId, contactId, params);
    case "update-event":
      return await updateEvent(params, { name: formData.get("name") });
  }
}

export default function Event() {
  const { event, contactsWithScore } = useLoaderData();
  const params = useParams();
  const revalidator = useRevalidator();
  useEffect(() => {
    const listenerRef = addWebsocketListener(params.groupId,
      async evnt => {
        if (evnt.type === "message" && (
          evnt.message === "score" ||
          evnt.message === "event")
        ) {
          revalidator.revalidate();
        }
      }
    );

    return () => {
      removeWebsocketListener(listenerRef);
    };
  }, []);

  return (
    <div id="event">
      <div>
        <h1>
          {event.name ? (
            <>
              {event.name}
            </>
          ) : (
            <i>Aktivitet utan namn</i>
          )}{" "}
        </h1>

        {event.notes && <p>{event.notes}</p>}

        {contactsWithScore
          ? <ContactList contacts={contactsWithScore} />
          : (" ")}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(e) => {
              if (!confirm(`Vill du verkligen ta bort aktiviten ${event.name ?? ""}`)) {
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

async function submitScore(result, scoreId, contactId, param) {
  const params = { ...param, ...{ scoreId, contactId } };
  if (!scoreId) {
    const score = await createScore(params, { result, contactId });
    return score;
  }
  
  return await updateScore(params, { result });
}

// function calculateScoreFromResults(result) {
//   const values = Object.values(results);
//   const userIds = Object.keys(results);
//   const sortedValues = [...values].sort((a, b) => a - b);
//   const scores = {};
//   for (let index = 0; index < values.length; index++) {
//     const result = values[index];
//     const userId = userIds[index];
//     const placing = sortedValues.indexOf(result);
//     scores[userId] = placing == 0
//       ? 0
//       : placing == 1
//         ? 1
//         : placing == 2
//           ? 3
//           : placing == 3
//             ? 5
//             : placing == 4
//               ? 7
//               : 10;
//   }

//   return scores;
// }

function ContactList({ contacts }) {
  return (
    <div>
      <ul>
        {contacts.map(contact => {
          return (
            <li key={contact._id} >
              <ContactResult contact={contact} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactResult({ contact }) {
  const score = contact.score ?? 0;
  const [result, setResult] = useState(contact.result ?? 0);
  console.log("ContactResult", contact.first, result, contact.result);

  return (
    <>
      <p>
        <b>{contact.first}{contact.last ? ` ${contact.last}` : ""}</b> {score} p
      </p>
      <Form method="post">
        <p>Resultat: <input
          name="result"
          type="number"
          value={result}
          onChange={(e) => setResult(parseInt(e.target.value))} />
        </p>
        <input type="hidden" value={contact._id} name="contactId" />
        <input type="hidden" value={contact.scoreId} name="scoreId" />
        <button type="submit" name="intent" value="submit-score">Spara</button>
      </Form>
    </>);
}

// function Favorite({ contact }) {
//   const fetcher = useFetcher();

//   const favorite = fetcher.formData
//     ? fetcher.formData.get("favorite") == "true"
//     : contact.favorite;

//   return (
//     <fetcher.Form method="post">
//       <button
//         name="favorite"
//         value={favorite ? "false" : "true"}
//         aria-label={
//           favorite
//             ? "Remove from favorites"
//             : "Add to favorites"
//         }
//       >
//         {favorite ? "★" : "☆"}
//       </button>
//     </fetcher.Form>
//   );
//}
