import React, { useEffect } from 'react';
import { App } from '@capacitor/app';
import './UpdateNotification.css';

const UpdateNotification = ({ isVisible, onUpdate, onDismiss, serverVersion, localVersion }) => {
  // Posluchač na hardware back button (Android)
  useEffect(() => {
    let backButtonListener;

    const setupBackButtonListener = async () => {
      if (isVisible) {
        // Přidat posluchač na back button - zavře notifikaci (dismiss)
        backButtonListener = await App.addListener('backButton', () => {
          console.log('Back button pressed in Update notification');
          onDismiss();
        });
      }
    };

    setupBackButtonListener();

    // Cleanup - odstranit posluchač
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="update-notification-overlay">
      <div className="update-notification">
        <div className="update-icon">🔄</div>
        <h3>Nová aktualizace k dispozici</h3>
        <p className="update-description">
          Je k dispozici nová verze rozvrhu topení.
        </p>
        <div className="version-info">
          <div className="version-row">
            <span className="version-label">Aktuální:</span>
            <span className="version-value">{localVersion || 'výchozí'}</span>
          </div>
          <div className="version-row">
            <span className="version-label">Nová:</span>
            <span className="version-value highlight">{serverVersion}</span>
          </div>
        </div>
        <div className="update-actions">
          <button className="btn-update" onClick={onUpdate}>
            Aktualizovat nyní
          </button>
          <button className="btn-dismiss" onClick={onDismiss}>
            Později
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
