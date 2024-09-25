import {
  Form,
  useLoaderData,
  // useFetcher
} from "react-router-dom";

import {
  getEvent,
  updateEvent
} from "../competition";

export async function loader({ params }) {
  const event = await getEvent(params.eventId);

  if (event) {
    document.title = `${window.documentTitle}: ${event.name}`;
    return { event };
  }

  throw new Response("", {
    status: 404,
    statusText: "Aktiviteten hittades inte"
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  return await updateEvent(params.eventId, {
    name: formData.get("name")
  });
}

export default function Event() {
  const { event } = useLoaderData();
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
            }}
          >
            <button type="submit">Ta bort</button>
          </Form>
        </div>
      </div>
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
