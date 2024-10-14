import {
  Form,
  useLoaderData,
  useParams
} from "react-router-dom";

import {
  addWebsocketListener,
  removeWebsocketListener
} from "../websocket";

import {
  useState,
  useEffect
} from "react";

import {
  getContact
} from "../api";

export async function loader({ params }) {
  console.log("Contactrouter");

  const contact = await getContact(params.contactId);

  if (contact) {
    document.title = `${window.documentTitle}: ${contact.first} ${contact.last}`;
    return { contact };
  }

  throw new Response("", {
    status: 404,
    statusText: "Kontakten hittades inte"
  });
}

export default function Contact() {
  const { contact } = useLoaderData();
  const params = useParams();

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
            <i>Kontakt utan namn</i>
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