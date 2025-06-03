import React from 'react';
import Lottie from 'lottie-react';
import successAnim from '../assets/success-check.json';

const SuccessAnimation = () => (
  <div className="text-center mt-4">
    <Lottie animationData={successAnim} loop={false} style={{ height: 180 }} />
    <h5 className="mt-3 text-success fw-semibold">Programare trimisă cu succes!</h5>
  </div>
);

export default SuccessAnimation;
