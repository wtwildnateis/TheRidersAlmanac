import { useState } from "react";
import MapComponent from "./Map";
import mapPinLogo from "../../assets/map_pin_logo.png";
import "./maps.css"; 

const filterConfig = {
  "Bike Shops": { keyword: "bike shop", type: "bicycle_store" },
  "Bike Trails": {
    keyword: ["bike trail", "Tower Grove Park", "Creve Coeur Lake", "Bike Path"],
    placeId: "ChIJycR4kUa12IcRqpSybQLFJ50",
  },
  "Skateparks": { keyword: "skatepark" },
  "Mountain Bike Trails": {
    keyword: ["mountain bike trails", "mountain bike park", "Castlewood state park"],
  },
  "Air Pumps": { keyword: ["gas station", "air pump"], type: "gas_station" },
};

const MapWrapper = () => {
  const [selectedType, setSelectedType] = useState("All");
  const categories = ["All", ...Object.keys(filterConfig)];

  return (
  <div className="resources-page map-page">
      <h1 className="page-title">Map</h1>

      <div className="resources-layout">
        {/* LEFT: Map card */}
        <section className="map-card">
          <div className="map-shell">
            <MapComponent selectedType={selectedType} filterConfig={filterConfig} />
          </div>


          {/* custom zoom (wired inside Map.jsx) */}
          <div id="zoom-stack-anchor" />
        </section>

        {/* RIGHT: Sidebar with Filters */}
        <aside className="sidebar">
          <div className="sidebar__inner">
            <div className="sidebar__title">LOCATIONS</div>
            <ul className="loc-list">
              {categories.map((type) => (
                <li key={type} className="loc-item" onClick={() => setSelectedType(type)}>
                  <span className="loc-icon" aria-hidden>
                    <img className="loc-icon-img" src={mapPinLogo} alt="" />
                    </span>
                    <span className="loc-name">{type}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapWrapper;