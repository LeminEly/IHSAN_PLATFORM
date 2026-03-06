import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { publicApi } from "../../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapView() {
  const [points, setPoints] = useState([]);
  const [center] = useState([18.0735, -15.9582]); // Nouakchott

  useEffect(() => {
    loadMapPoints();
  }, []);

  const loadMapPoints = async () => {
    try {
      const response = await publicApi.getMap({ limit: 100 });
      setPoints(response.data.data.points);
    } catch (error) {
      console.error("Error loading map:", error);
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]}>
          <Popup>
            <div className="text-sm">
              <strong>{point.title}</strong>
              <br />
              Montant: {point.amount} MRU
              <br />
              Quartier: {point.quarter}
              <br />
              <small>{new Date(point.date).toLocaleDateString()}</small>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
