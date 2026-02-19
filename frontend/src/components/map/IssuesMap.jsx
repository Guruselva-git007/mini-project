import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Use CDN-hosted marker assets so Vite builds consistently.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const fallbackCenter = [20.5937, 78.9629];

const IssuesMap = ({ issues = [] }) => {
  const points = issues.filter(
    (issue) => issue.latitude !== null && issue.longitude !== null
  );

  const center = points.length
    ? [points[0].latitude, points[0].longitude]
    : fallbackCenter;

  return (
    <div className="card map-card">
      <h3>Issues Map</h3>
      <MapContainer center={center} zoom={13} scrollWheelZoom className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((issue) => (
          <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
            <Popup>
              <strong>{issue.title}</strong>
              <p>Status: {issue.status}</p>
              <p>Category: {issue.category}</p>
              <p>Priority: {issue.priorityLabel}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IssuesMap;
