import React from "react";
import { Link } from "react-router-dom";
import { Hammer, ArrowLeft, Construction } from "lucide-react";
import "./PlaceholderPage.css";

export default function PlaceholderPage() {
  return (
    <div className="placeholder-page-wrapper font-inter">
      <div className="placeholder-glow-effect" />
      <div className="placeholder-card-frame">
        <div className="placeholder-icon-badge">
          <Construction size={40} className="icon-construction-animation" />
        </div>
        
        <h1 className="placeholder-title font-plus-jakarta">Section Under Construction</h1>
        <p className="placeholder-description">
          We are currently working behind the scenes to engineer this section of TravelKart. 
          Expect a premium luxury layout designed for smooth global exploration routing very soon!
        </p>

        <div className="placeholder-progress-bar-container">
          <div className="placeholder-progress-bar-filled" />
        </div>

        <Link to="/" className="placeholder-home-btn font-plus-jakarta">
          <ArrowLeft size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
