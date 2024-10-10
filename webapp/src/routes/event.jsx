import {
  Form,
  useLoaderData
} from "react-router-dom";

import {
  getEvent,
  updateEvent,
  getContacts
} from "../api";

export async function loader({ params }) {
  const event = await getEvent(params.eventId);
  const contacts = await getContacts(params.groupId);

  if (event) {
    document.title = `${window.documentTitle}: ${event.name}`;
    return { event, contacts };
  }

  throw new Response("Aktiviteten hittades inte", {
    status: 404,
    statusText: "Aktiviteten hittades inte"
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  return await updateEvent(params, { name: formData.get("name") });
}

export default function Event() {
  const { event, contacts } = useLoaderData();
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

        {contacts
          ? <ContactList contacts={contacts} event={event} />
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

async function onScoreChanged(e, event) {
  if (e.target.value === "") {
    return;
  }

  const userId = e.target.name;
  const result = parseInt(e.target.value);
  const results = event.results ?? {};
  results[userId] = result;
  const scores = calculateScoresFromResults(results);

  await updateEvent(event, { results, scores });
}

function calculateScoresFromResults(results) {
  const values = Object.values(results);
  const userIds = Object.keys(results);
  const sortedValues = [...values].sort((a, b) => a - b);
  const scores = {};
  for (let index = 0; index < values.length; index++) {
    const result = values[index];
    const userId = userIds[index];
    const placing = sortedValues.indexOf(result);
    scores[userId] = placing == 0
      ? 0
      : placing == 1
        ? 1
        : placing == 2
          ? 3
          : placing == 3
            ? 5
            : placing == 4
              ? 7
              : 10;
  }

  return scores;
}

function ContactList({ contacts, event }) {
  return (
    <div>
      <ul>
        {contacts.map(contact => {
          const score = event.scores && event.scores[contact._id]
            ? event.scores[contact._id]
            : 0;
          const result = event.results && event.results[contact._id]
            ? event.results[contact._id]
            : 0;

          return (
            <li key={contact._id}>
              <p>
                <b>{contact.first}{contact.last ? ` ${contact.last}` : ""}</b> {score} p
              </p>
              <p>Resultat: <input
                name={contact._id}
                type="numeric"
                value={result}
                onChange={(e) => onScoreChanged(e, event)}></input>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
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
