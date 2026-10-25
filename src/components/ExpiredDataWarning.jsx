import React, { useEffect } from 'react';
import { App } from '@capacitor/app';
import './ExpiredDataWarning.css';

const ExpiredDataWarning = ({ isVisible, onDismiss, validTo }) => {
  // Posluchač na hardware back button (Android)
  useEffect(() => {
    let backButtonListener;

    const setupBackButtonListener = async () => {
      if (isVisible) {
        backButtonListener = await App.addListener('backButton', () => {
          console.log('Back button pressed in Expired warning');
          onDismiss();
        });
      }
    };

    setupBackButtonListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="expired-warning-overlay">
      <div className="expired-warning">
        <div className="expired-icon">⚠️</div>
        <h3>Rozvrh topení již není platný</h3>
        <p className="expired-description">
          Aktuální rozvrh topení platil do <strong>{validTo}</strong>.
        </p>
        <p className="expired-description">
          Prosím aktualizujte konfiguraci na novější verzi.
        </p>
        <div className="expired-actions">
          <button className="btn-expired-ok" onClick={onDismiss}>
            Rozumím
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredDataWarning;
