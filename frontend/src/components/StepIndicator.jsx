import React from 'react';
import './StepIndicator.css'; // Important!

function StepIndicator({ activeStep }) {
  return (
    <div className="steps">
      <div className={`step ${activeStep >= 1 ? (activeStep === 1 ? 'active' : 'completed') : ''}`}>
        <div className="circle">1</div>
        <div className="label">Coș</div>
      </div>
      <div className={`step ${activeStep >= 2 ? (activeStep === 2 ? 'active' : 'completed') : ''}`}>
        <div className="circle">2</div>
        <div className="label">Finalizare</div>
      </div>
      <div className={`step ${activeStep >= 3 ? (activeStep === 3 ? 'active' : '') : ''}`}>
        <div className="circle">3</div>
        <div className="label">Confirmare</div>
      </div>
    </div>
  );
}

export default StepIndicator;
