import React from 'react';
import '../styles/PortalLoader.css';

const PortalLoader = ({ portalName = 'Portal' }) => {
  return (
    <div className="portal-loader-overlay">
      <div className="portal-loader-orb portal-loader-orb-left"></div>
      <div className="portal-loader-orb portal-loader-orb-right"></div>

      <div className="portal-loader-content">
        <div className="portal-loader-ring"></div>
        <img src="/logo.png" alt="Academia Logo" className="portal-loader-logo" />
        <h1 className="portal-loader-title">Academia Sphere</h1>
        <p className="portal-loader-subtitle">{portalName}</p>

        <div className="portal-loader-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default PortalLoader;
