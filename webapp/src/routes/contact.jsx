import {
  Form,
  useLoaderData,
  useParams
} from "react-router-dom";

import {
  useState,
  useEffect
} from "react";

import {
  getContact
} from "../api";

import {
  addWebsocketListener,
  removeWebsocketListener
} from "../websocket";

export async function loader({ params }) {
  const contact = await getContact(params.contactId);

  if (contact) {
    document.title = `${window.documentTitle}: ${contact.first} ${contact.last}`;
    return { initialData: contact };
  }

  throw new Response("", {
    status: 404,
    statusText: "Kontakten hittades inte"
  });
}

export default function Contact() {
  const { initialData } = useLoaderData();
  const [contact, setData] = useState(initialData);
  const params = useParams();

  useEffect(() => {
    const listenerRef = addWebsocketListener(params.groupId,
      async evnt => {
        if (evnt.type === "message" && evnt.message === "contact") {
          setData(await getContact(params.contactId));
        }
      });

    return () => {
      removeWebsocketListener(listenerRef);
    }
  }, []);

  return (
    <div id="contact">
      <div>
        <img
          key={contact.avatar}
          src={contact.avatar ||
            `https://robohash.org/${contact._id}.png?size=200x200`
          }
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
        </h1>

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (!confirm("Please confirm you want to delete this record.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}