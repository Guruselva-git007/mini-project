import { ROLES } from "../../utils/roles";

const statuses = ["Pending", "In Progress", "Resolved"];

const IssueList = ({
  issues,
  userRole,
  onStatusChange,
  emptyText = "No issues found"
}) => {
  if (!issues || issues.length === 0) {
    return <div className="card">{emptyText}</div>;
  }

  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Reports</th>
            <th>Priority</th>
            <th>Created</th>
            {(userRole === ROLES.AUTHORITY || userRole === ROLES.ADMIN) && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>
                <p>{issue.title}</p>
                <p className="muted small">{issue.description?.slice(0, 100)}</p>
              </td>
              <td>{issue.category}</td>
              <td>{issue.status}</td>
              <td>{issue.reportCount}</td>
              <td>
                {issue.priorityLabel} ({Math.round(issue.priorityScore)})
              </td>
              <td>{new Date(issue.createdAt).toLocaleString()}</td>
              {(userRole === ROLES.AUTHORITY || userRole === ROLES.ADMIN) && (
                <td>
                  <select
                    value={issue.status}
                    onChange={(event) => onStatusChange?.(issue.id, event.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueList;
