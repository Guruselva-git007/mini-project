import { useCallback, useEffect, useState } from "react";
import {
  createDepartment,
  fetchDepartments,
  fetchUsers,
  updateUser
} from "../api/admin.api";
import { fetchAdminDashboard } from "../api/dashboard.api";
import StatCard from "../components/dashboard/StatCard";
import { ROLES } from "../utils/roles";

const roleOptions = [ROLES.CITIZEN, ROLES.AUTHORITY, ROLES.ADMIN];

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState({ usersByRole: [], issuesByStatus: [] });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentForm, setDepartmentForm] = useState({ name: "", areaCode: "" });

  const load = useCallback(async () => {
    const [metricsResponse, usersResponse, departmentsResponse] = await Promise.all([
      fetchAdminDashboard(),
      fetchUsers(),
      fetchDepartments()
    ]);

    setMetrics(metricsResponse);
    setUsers(usersResponse.users);
    setDepartments(departmentsResponse.departments);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleUpdate = async (userId, role) => {
    await updateUser(userId, { role });
    await load();
  };

  const handleDepartmentCreate = async (event) => {
    event.preventDefault();
    await createDepartment(departmentForm);
    setDepartmentForm({ name: "", areaCode: "" });
    await load();
  };

  const usersTotal = metrics.usersByRole.reduce((sum, row) => sum + row.total, 0);
  const issuesTotal = metrics.issuesByStatus.reduce((sum, row) => sum + row.total, 0);

  return (
    <section className="stacked">
      <div className="grid-four">
        <StatCard label="Users" value={usersTotal} />
        <StatCard label="Departments" value={departments.length} />
        <StatCard label="Issues" value={issuesTotal} />
        <StatCard label="Authorities" value={users.filter((user) => user.role === ROLES.AUTHORITY).length} />
      </div>

      <div className="card table-wrap">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleUpdate(user.id, event.target.value)}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{user.department?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card table-wrap">
        <h3>Departments</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Area Code</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department.id}>
                <td>{department.name}</td>
                <td>{department.areaCode}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form className="grid-two" onSubmit={handleDepartmentCreate}>
          <input
            value={departmentForm.name}
            onChange={(event) =>
              setDepartmentForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Department name"
            required
          />
          <input
            value={departmentForm.areaCode}
            onChange={(event) =>
              setDepartmentForm((prev) => ({ ...prev, areaCode: event.target.value }))
            }
            placeholder="Area code"
            required
          />
          <button className="btn" type="submit">
            Create Department
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
