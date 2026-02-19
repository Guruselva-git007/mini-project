import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchIssues } from "../api/issues.api";
import IssuesMap from "../components/map/IssuesMap";
import IssueList from "../components/issues/IssueList";
import { useAuth } from "../context/AuthContext";
import useRealtimeIssues from "../hooks/useRealtimeIssues";

const MapPage = () => {
  const { token, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ status: "", category: "" });

  const load = useCallback(async () => {
    const response = await fetchIssues(filters);
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

  return (
    <section className="stacked">
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
            placeholder="Filter category"
          />
        </div>

        <button className="btn" type="button" onClick={load}>
          Apply
        </button>
      </div>

      <IssuesMap issues={issues} />
      <IssueList issues={issues} userRole={user.role} />
    </section>
  );
};

export default MapPage;
