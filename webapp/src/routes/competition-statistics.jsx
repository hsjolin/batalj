import { useLoaderData, useParams, Link } from "react-router-dom";
import { getCompetitionStatistics } from "../api";

export async function loader({ params }) {
  const statistics = await getCompetitionStatistics(params.groupSlug, params.competitionId);
  return { statistics };
}

export default function CompetitionStatistics() {
  const { statistics } = useLoaderData();
  const params = useParams();

  const sortedStats = [...statistics].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div id="statistics">
      <h1>Tävlingsstatistik</h1>
      <Link to={`/group/${params.groupSlug}/competitions/${params.competitionId}`}>
        ← Tillbaka till tävling
      </Link>

      {sortedStats.length > 0 ? (
        <div>
          <table>
            <thead>
              <tr>
                <th>Placering</th>
                <th>Namn</th>
                <th>Poäng</th>
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

          <h2>Aktivitetsresultat</h2>
          {sortedStats.map(stat => (
            <div key={stat.contactId} className="contact-activity-breakdown">
              <h3>{stat.contactName}</h3>
              {stat.activityResults && stat.activityResults.length > 0 ? (
                <ul>
                  {stat.activityResults.map((activity, idx) => (
                    <li key={idx}>
                      <strong>{activity.activityName}:</strong> Placering {activity.placement}
                      ({activity.points} poäng)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Inga aktivitetsresultat</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Ingen statistik tillgänglig än.</p>
      )}
    </div>
  );
}
