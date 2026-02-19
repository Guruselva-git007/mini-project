import { useEffect, useState } from "react";
import useGeoLocation from "../../hooks/useGeoLocation";

const categories = [
  "Road Damage",
  "Waste Management",
  "Streetlight",
  "Water Leakage",
  "Public Safety",
  "Drainage",
  "Other"
];

const IssueForm = ({ onSubmit, loading, departments = [] }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    severity: 3,
    address: "",
    departmentId: ""
  });
  const [image, setImage] = useState(null);

  const { latitude, longitude, loading: geoLoading, error, capture } = useGeoLocation();

  useEffect(() => {
    capture();
  }, [capture]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (latitude === null || longitude === null) {
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("severity", String(form.severity));
    payload.append("latitude", String(latitude));
    payload.append("longitude", String(longitude));

    if (form.address) {
      payload.append("address", form.address);
    }

    if (form.departmentId) {
      payload.append("departmentId", form.departmentId);
    }

    if (image) {
      payload.append("image", image);
    }

    onSubmit(payload);
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Report Civic Issue</h2>

      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Example: Pothole near Main Street"
        required
      />

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        required
      />

      <div className="grid-two">
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="severity">Severity (1-5)</label>
          <input
            id="severity"
            name="severity"
            type="number"
            min={1}
            max={5}
            value={form.severity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <label htmlFor="address">Address (optional)</label>
      <input
        id="address"
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="Street, landmark, ward"
      />

      {departments.length > 0 && (
        <>
          <label htmlFor="departmentId">Department (optional)</label>
          <select
            id="departmentId"
            name="departmentId"
            value={form.departmentId}
            onChange={handleChange}
          >
            <option value="">Unassigned</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </>
      )}

      <label htmlFor="image">Upload Image</label>
      <input
        id="image"
        type="file"
        accept="image/*"
        onChange={(event) => setImage(event.target.files?.[0] ?? null)}
      />

      <div className="geo-line">
        <p className="muted">
          Location: {latitude ? latitude.toFixed(6) : "-"}, {longitude ? longitude.toFixed(6) : "-"}
        </p>
        <button className="btn btn-outline" type="button" onClick={capture} disabled={geoLoading}>
          {geoLoading ? "Capturing..." : "Refresh GPS"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <button className="btn" disabled={loading || latitude === null || longitude === null} type="submit">
        {loading ? "Submitting..." : "Submit Issue"}
      </button>
    </form>
  );
};

export default IssueForm;
