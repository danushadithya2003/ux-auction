import { NavLink } from "react-router-dom";
import "./layout.css";

const NAV_ITEMS = [
  { to: "/play/live", label: "Live Auction", icon: "🔨" },
  { to: "/play/items", label: "All Items", icon: "🗂️" },
  { to: "/play/collection", label: "My Collection", icon: "🎒" },
  { to: "/play/players", label: "Players", icon: "👥" },
  { to: "/play/how-it-works", label: "How It Works", icon: "❓" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " sidebar-link-active" : "")}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-manifesto">
        <p>Different Resources.</p>
        <p>New Perspectives.</p>
        <p>A Better Solution.</p>
        <div className="sidebar-divider" />
        <p className="sidebar-tagline">Good design builds better outcomes.</p>
      </div>
    </aside>
  );
}
