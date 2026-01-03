import { useLoaderData, useParams, Link } from "react-router-dom";
import { getGroupStatistics } from "../api";

export async function loader({ params }) {
  const statistics = await getGroupStatistics(params.groupSlug);
  return { statistics };
}

export default function GroupStatistics() {
  const { statistics } = useLoaderData();
  const params = useParams();

  const sortedStats = [...statistics].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div id="statistics">
      <h1>Gruppstatistik</h1>
      <Link to={`/group/${params.groupSlug}`}>← Tillbaka till grupp</Link>

      {sortedStats.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Placering</th>
              <th>Namn</th>
              <th>Totala poäng</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat, index) => (
              <tr key={stat.contactId}>
                <td>{index + 1}</td>
                <td>{stat.contactName}</td>
                <td>{stat.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Ingen statistik tillgänglig än.</p>
      )}
    </div>
  );
}
