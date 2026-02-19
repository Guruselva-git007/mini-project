import { useEffect, useState } from "react";
import IssueForm from "../components/issues/IssueForm";
import { createIssue } from "../api/issues.api";
import { fetchSharedDepartments } from "../api/admin.api";

const ReportIssuePage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetchSharedDepartments();
        setDepartments(response.departments);
      } catch {
        setDepartments([]);
      }
    };

    loadDepartments();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setMessage("");
      setError("");
      const response = await createIssue(payload);
      setMessage(
        response.isDuplicate
          ? `Duplicate matched with existing issue (similarity: ${response.similarity}).`
          : "Issue reported successfully."
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stacked">
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <IssueForm onSubmit={handleSubmit} loading={loading} departments={departments} />
    </section>
  );
};

export default ReportIssuePage;
