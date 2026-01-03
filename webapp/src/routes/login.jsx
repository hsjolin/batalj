import { useState, useEffect } from "react";
import { Form, redirect, useNavigate, useSearchParams, useActionData } from "react-router-dom";
import { login, verifyToken, createGroup } from "../api";

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const groupSlug = formData.get("groupSlug");
  const password = formData.get("password");

  if (intent === "create-group") {
    const groupName = formData.get("groupName");
    try {
      const group = await createGroup({ name: groupName, password });
      await login(group.slug, password);
      return redirect(`/group/${group.slug}`);
    } catch (error) {
      return { error: "Kunde inte skapa grupp" };
    }
  }

  try {
    const result = await login(groupSlug, password);
    return redirect(`/group/${groupSlug}`);
  } catch (error) {
    return { error: "Ogiltigt grupp-ID eller lösenord" };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionData = useActionData();
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setVerifying(true);
      verifyToken(token)
        .then(result => {
          navigate(`/group/${result.groupSlug}`);
        })
        .catch(err => {
          setError("Ogiltig eller utgången inbjudningslänk");
          setVerifying(false);
        });
    }
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div id="login">
        <h1>Verifierar inbjudan...</h1>
      </div>
    );
  }

  return (
    <div id="login">
      <h1>Batalj</h1>

      {!showCreateGroup ? (
        <>
          <h2>Logga in</h2>
          <Form method="post">
            <div>
              <label htmlFor="groupSlug">Grupp-ID:</label>
              <input
                type="text"
                id="groupSlug"
                name="groupSlug"
                required
                placeholder="t.ex. broedrakampen"
              />
            </div>
            <div>
              <label htmlFor="password">Lösenord:</label>
              <input
                type="password"
                id="password"
                name="password"
                required
              />
            </div>
            {(error || actionData?.error) && <p className="error">{error || actionData.error}</p>}
            <button type="submit" name="intent" value="login">Logga in</button>
          </Form>
          <p>
            <button type="button" onClick={() => setShowCreateGroup(true)}>
              Skapa ny grupp
            </button>
          </p>
        </>
      ) : (
        <>
          <h2>Skapa ny grupp</h2>
          <Form method="post">
            <div>
              <label htmlFor="groupName">Gruppnamn:</label>
              <input
                type="text"
                id="groupName"
                name="groupName"
                required
                placeholder="t.ex. Brödrakampen 2026"
              />
            </div>
            <div>
              <label htmlFor="password">Lösenord:</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Välj ett lösenord"
              />
            </div>
            {(error || actionData?.error) && <p className="error">{error || actionData.error}</p>}
            <button type="submit" name="intent" value="create-group">Skapa grupp</button>
          </Form>
          <p>
            <button type="button" onClick={() => setShowCreateGroup(false)}>
              Tillbaka till inloggning
            </button>
          </p>
        </>
      )}
    </div>
  );
}
