import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCitizenDashboard } from "../api/dashboard.api";
import { fetchMyIssues } from "../api/issues.api";
import IssueList from "../components/issues/IssueList";
import IssuesMap from "../components/map/IssuesMap";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../context/AuthContext";
import useRealtimeIssues from "../hooks/useRealtimeIssues";

const CitizenDashboardPage = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0
  });
  const [issues, setIssues] = useState([]);

  const load = useCallback(async () => {
    const [dashboardResponse, issueResponse] = await Promise.all([
      fetchCitizenDashboard(),
      fetchMyIssues()
    ]);

    setSummary(dashboardResponse.summary);
    setIssues(issueResponse.issues);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlers = useMemo(
    () => ({
      onIssueCreated: load,
      onIssueUpdated: load,
      onIssueMerged: load
    }),
    [load]
  );

  useRealtimeIssues({ token, handlers });

  return (
    <section className="stacked">
      <div className="grid-four">
        <StatCard label="Total" value={summary.total} />
        <StatCard label="Pending" value={summary.pending} />
        <StatCard label="In Progress" value={summary.in_progress} />
        <StatCard label="Resolved" value={summary.resolved} />
      </div>

      <IssueList issues={issues} userRole="Citizen" emptyText="You have not reported any issues yet." />
      <IssuesMap issues={issues} />
    </section>
  );
};

export default CitizenDashboardPage;
