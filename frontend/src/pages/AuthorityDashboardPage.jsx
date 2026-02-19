import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAuthorityDashboard } from "../api/dashboard.api";
import { updateIssueStatus } from "../api/issues.api";
import IssueList from "../components/issues/IssueList";
import StatCard from "../components/dashboard/StatCard";
import IssuesMap from "../components/map/IssuesMap";
import { useAuth } from "../context/AuthContext";
import useRealtimeIssues from "../hooks/useRealtimeIssues";

const AuthorityDashboardPage = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0
  });
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    category: ""
  });

  const load = useCallback(async () => {
    const response = await fetchAuthorityDashboard(filters);
    setSummary(response.summary);
    setIssues(response.issues);
  }, [filters]);

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

  const handleStatusChange = async (issueId, status) => {
    await updateIssueStatus(issueId, { status });
    await load();
  };

  return (
    <section className="stacked">
      <div className="grid-four">
        <StatCard label="Total" value={summary.total} />
        <StatCard label="Pending" value={summary.pending} />
        <StatCard label="In Progress" value={summary.in_progress} />
        <StatCard label="Resolved" value={summary.resolved} />
      </div>

      <div className="card filters-row">
        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <input
            id="category"
            value={filters.category}
            onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            placeholder="Filter by category"
          />
        </div>

        <button className="btn" type="button" onClick={load}>
          Apply Filters
        </button>
      </div>

      <IssueList issues={issues} userRole="Authority" onStatusChange={handleStatusChange} />
      <IssuesMap issues={issues} />
    </section>
  );
};

export default AuthorityDashboardPage;
