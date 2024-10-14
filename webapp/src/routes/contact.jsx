import {
  Form,
  redirect,
  useLoaderData
} from "react-router-dom";

import {
  getContact,
  deleteContact
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

export async function action({ params }) {
  await deleteContact(params.contactId, params.groupId);
  return null;
}
export default function Contact() {
  const { contact } = useLoaderData();

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
            onSubmit={(event) => {
              if (!confirm("Please confirm you want to delete this record.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit" name="delete-intent">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}