// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, User, CreditCard, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Phone, MapPin, MessageSquare, Loader2 } from 'lucide-react';

// // Import PaymentProcessor (trebuie să ai fișierul separat)
// // import PaymentProcessor from './PaymentProcessor';

// // Pentru demo, voi include o versiune simplificată a PaymentProcessor
// const PaymentProcessor = ({ bookingData, paymentMethod, onPaymentSuccess, onPaymentError, isProcessing }) => {
//   const [cardData, setCardData] = useState({
//     cardNumber: '1234 5678 9012 3456',
//     expiryDate: '12/26',
//     cvv: '123',
//     cardholderName: 'NUME PRENUME'
//   });

//   const handlePayment = async () => {
//     // Simulare plată cu succes pentru demo
//     setTimeout(() => {
//       onPaymentSuccess({
//         success: true,
//         transactionId: `TXN_${Date.now()}`,
//         paymentMethod: paymentMethod,
//         bookingId: Math.floor(Math.random() * 1000) + 1,
//         booking: { id: Math.floor(Math.random() * 1000) + 1 }
//       });
//     }, 2000);
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <h3 className="text-lg font-semibold mb-4">Plată cu Cardul</h3>
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Numărul cardului</label>
//           <input
//             type="text"
//             value={cardData.cardNumber}
//             onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value }))}
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             placeholder="1234 5678 9012 3456"
//           />
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Data expirării</label>
//             <input
//               type="text"
//               value={cardData.expiryDate}
//               onChange={(e) => setCardData(prev => ({ ...prev, expiryDate: e.target.value }))}
//               className="w-full p-3 border border-gray-300 rounded-lg"
//               placeholder="MM/YY"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">CVV</label>
//             <input
//               type="text"
//               value={cardData.cvv}
//               onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
//               className="w-full p-3 border border-gray-300 rounded-lg"
//               placeholder="123"
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Numele de pe card</label>
//           <input
//             type="text"
//             value={cardData.cardholderName}
//             onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             placeholder="NUME PRENUME"
//           />
//         </div>
//         <div className="mt-6">
//           <button
//             onClick={handlePayment}
//             disabled={isProcessing}
//             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
//           >
//             {isProcessing ? (
//               <>
//                 <Loader2 className="animate-spin mr-2" size={16} />
//                 Procesează plata...
//               </>
//             ) : (
//               <>
//                 Plătește {bookingData.totalAmount} RON
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BookingSystem = () => {
//   // States pentru step-uri
//   const [currentStep, setCurrentStep] = useState(1);
//   const [isProcessing, setIsProcessing] = useState(false);
  
//   // States pentru datele rezervării
//   const [bookingData, setBookingData] = useState({
//     serviceName: 'Curatenie generala apartament',
//     serviceCategory: 'Residential',
//     serviceId: 1,
//     selectedDate: '',
//     selectedTime: '',
//     duration: 120,
//     totalAmount: 360,
//     address: '',
//     phone: '',
//     specialInstructions: '',
//     contactMethod: 'phone',
//     urgency: 'normal',
//     additionalServices: []
//   });
  
//   // State pentru rezultatul rezervării
//   const [bookingResult, setBookingResult] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [errorMessage, setErrorMessage] = useState('');

//   // Funcții pentru navigarea între step-uri
//   const handleNext = () => {
//     console.log('🎯 Attempting to go to next step...');
//     console.log('📋 Current step:', currentStep);
//     console.log('📅 Booking data:', bookingData);

//     // Validări pentru fiecare step
//     if (currentStep === 1) {
//       if (!bookingData.selectedDate || !bookingData.selectedTime) {
//         setErrorMessage('Te rugăm să selectezi data și ora serviciului');
//         return;
//       }
//     }
    
//     if (currentStep === 2) {
//       if (!bookingData.address || !bookingData.phone) {
//         setErrorMessage('Te rugăm să completezi adresa și numărul de telefon');
//         return;
//       }
//     }

//     setErrorMessage('');
//     console.log('✅ Validation passed, moving to next step...');
//     setCurrentStep(prev => prev + 1);
//   };

//   const handlePrevious = () => {
//     console.log('🔙 Going to previous step...');
//     setCurrentStep(prev => prev - 1);
//     setErrorMessage('');
//   };

//   // Handlers pentru plată
//   const handlePaymentSuccess = (paymentResult) => {
//     console.log('✅ Payment success handler called with:', paymentResult);
    
//     try {
//       // Salvează datele rezervării pentru confirmare
//       setBookingResult(paymentResult);
      
//       console.log('📝 Booking result saved:', paymentResult);
//       console.log('🔄 Moving to success step...');
      
//       // Du-te la step-ul de confirmare (step 4)
//       setCurrentStep(4);
      
//       console.log('✅ Successfully moved to step 4 (confirmation)');
      
//       // Clear any previous errors
//       setErrorMessage('');
      
//     } catch (error) {
//       console.error('❌ Error in payment success handler:', error);
//       setErrorMessage('Eroare la procesarea confirmării. Te rugăm să contactezi suportul.');
//     }
//   };

//   const handlePaymentError = (error) => {
//     console.error('💥 Payment error handler called with:', error);
//     setErrorMessage(error);
//     setIsProcessing(false);
//   };

//   // Funcții pentru actualizarea datelor
//   const updateBookingData = (field, value) => {
//     console.log(`📝 Updating ${field}:`, value);
//     setBookingData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Generare ore disponibile
//   const generateTimeSlots = () => {
//     const slots = [];
//     for (let hour = 8; hour <= 17; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//         slots.push(timeString);
//       }
//     }
//     return slots;
//   };

//   // Render pentru step 1 - Selectarea datei și orei
//   const renderStep1 = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <Calendar className="mx-auto mb-4 text-blue-600" size={48} />
//         <h2 className="text-2xl font-bold mb-2">Alege Data și Ora</h2>
//         <p className="text-gray-600">Selectează când dorești să fie efectuat serviciul</p>
//       </div>

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Data serviciului *</label>
//           <input
//             type="date"
//             value={bookingData.selectedDate}
//             onChange={(e) => updateBookingData('selectedDate', e.target.value)}
//             min={new Date().toISOString().split('T')[0]}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Ora serviciului *</label>
//           <div className="grid grid-cols-5 gap-2">
//             {generateTimeSlots().map(time => (
//               <button
//                 key={time}
//                 onClick={() => updateBookingData('selectedTime', time)}
//                 className={`p-2 text-sm rounded border ${
//                   bookingData.selectedTime === time
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 {time}
//               </button>
//             ))}
//           </div>
//         </div>

//         {bookingData.selectedDate && bookingData.selectedTime && (
//           <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//             <p className="text-green-800">
//               <CheckCircle className="inline mr-2" size={16} />
//               Serviciul va fi efectuat pe {bookingData.selectedDate} la ora {bookingData.selectedTime}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // Render pentru step 2 - Detaliile rezervării
//   const renderStep2 = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <User className="mx-auto mb-4 text-blue-600" size={48} />
//         <h2 className="text-2xl font-bold mb-2">Detalii Rezervare</h2>
//         <p className="text-gray-600">Completează informațiile necesare</p>
//       </div>

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             <MapPin className="inline mr-1" size={16} />
//             Adresa *
//           </label>
//           <input
//             type="text"
//             value={bookingData.address}
//             onChange={(e) => updateBookingData('address', e.target.value)}
//             placeholder="Strada, numărul, orașul"
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             <Phone className="inline mr-1" size={16} />
//             Numărul de telefon *
//           </label>
//           <input
//             type="tel"
//             value={bookingData.phone}
//             onChange={(e) => updateBookingData('phone', e.target.value)}
//             placeholder="0721234567"
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             <MessageSquare className="inline mr-1" size={16} />
//             Instrucțiuni speciale (opțional)
//           </label>
//           <textarea
//             value={bookingData.specialInstructions}
//             onChange={(e) => updateBookingData('specialInstructions', e.target.value)}
//             placeholder="Detalii suplimentare despre serviciu..."
//             rows={3}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//           <h3 className="font-semibold text-blue-800 mb-2">Rezumatul serviciului:</h3>
//           <div className="space-y-1 text-blue-700">
//             <p><strong>Serviciu:</strong> {bookingData.serviceName}</p>
//             <p><strong>Data și ora:</strong> {bookingData.selectedDate} la {bookingData.selectedTime}</p>
//             <p><strong>Durată estimată:</strong> {bookingData.duration} minute</p>
//             <p><strong>Preț:</strong> {bookingData.totalAmount} RON</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Render pentru step 3 - Plata
//   const renderStep3 = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <CreditCard className="mx-auto mb-4 text-blue-600" size={48} />
//         <h2 className="text-2xl font-bold mb-2">Finalizează Plata</h2>
//         <p className="text-gray-600">Alege metoda de plată preferată</p>
//       </div>

//       {/* Selectorul metodei de plată */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {[
//           { id: 'card', name: 'Card', icon: CreditCard },
//           { id: 'cash', name: 'Numerar', icon: () => <span className="text-2xl">💵</span> },
//           { id: 'transfer', name: 'Transfer', icon: () => <span className="text-2xl">🏦</span> }
//         ].map(method => (
//           <button
//             key={method.id}
//             onClick={() => setPaymentMethod(method.id)}
//             className={`p-4 rounded-lg border text-center ${
//               paymentMethod === method.id
//                 ? 'bg-blue-600 text-white border-blue-600'
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             <method.icon className="mx-auto mb-2" size={24} />
//             <span className="text-sm font-medium">{method.name}</span>
//           </button>
//         ))}
//       </div>

//       {/* Componenta de plată */}
//       <PaymentProcessor
//         bookingData={bookingData}
//         paymentMethod={paymentMethod}
//         onPaymentSuccess={handlePaymentSuccess}
//         onPaymentError={handlePaymentError}
//         isProcessing={isProcessing}
//       />
//     </div>
//   );

//   // Render pentru step 4 - Confirmarea succesului
//   const renderStep4 = () => (
//     <div className="text-center space-y-6">
//       <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
//         <CheckCircle className="text-green-600" size={48} />
//       </div>
      
//       <div>
//         <h2 className="text-3xl font-bold text-green-800 mb-2">Rezervarea Confirmată!</h2>
//         <p className="text-lg text-gray-600">Rezervarea dvs. a fost procesată cu succes</p>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow border max-w-md mx-auto">
//         <h3 className="text-lg font-semibold mb-4 text-gray-800">Detalii Rezervare</h3>
//         <div className="space-y-3 text-left">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Numărul rezervării:</span>
//             <span className="font-semibold">#{bookingResult?.bookingId}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Serviciu:</span>
//             <span className="font-semibold">{bookingData.serviceName}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Data și ora:</span>
//             <span className="font-semibold">{bookingData.selectedDate} la {bookingData.selectedTime}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Adresa:</span>
//             <span className="font-semibold">{bookingData.address}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Suma plătită:</span>
//             <span className="font-semibold text-green-600">{bookingData.totalAmount} RON</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Metoda de plată:</span>
//             <span className="font-semibold">{bookingResult?.paymentMethod}</span>
//           </div>
//           {bookingResult?.transactionId && (
//             <div className="flex justify-between">
//               <span className="text-gray-600">ID tranzacție:</span>
//               <span className="font-semibold text-xs">{bookingResult.transactionId}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md mx-auto">
//         <h4 className="font-semibold text-blue-800 mb-2">Ce urmează?</h4>
//         <ul className="text-blue-700 text-sm space-y-1">
//           <li>• Veți primi un email de confirmare</li>
//           <li>• Echipa noastră vă va contacta cu 24h înainte</li>
//           <li>• Pentru modificări, sunați la 0721234567</li>
//         </ul>
//       </div>

//       <div className="flex gap-4 justify-center">
//         <button
//           onClick={() => window.location.href = '/'}
//           className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
//         >
//           Înapoi la Prima Pagină
//         </button>
//         <button
//           onClick={() => {
//             setCurrentStep(1);
//             setBookingResult(null);
//             setBookingData({
//               serviceName: 'Curatenie generala apartament',
//               serviceCategory: 'Residential',
//               serviceId: 1,
//               selectedDate: '',
//               selectedTime: '',
//               duration: 120,
//               totalAmount: 360,
//               address: '',
//               phone: '',
//               specialInstructions: '',
//               contactMethod: 'phone',
//               urgency: 'normal',
//               additionalServices: []
//             });
//           }}
//           className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700"
//         >
//           Rezervare Nouă
//         </button>
//       </div>
//     </div>
//   );

//   // Progress indicator
//   const ProgressIndicator = () => (
//     <div className="flex items-center justify-center mb-8">
//       {[1, 2, 3, 4].map(step => (
//         <React.Fragment key={step}>
//           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
//             step <= currentStep
//               ? 'bg-blue-600 text-white'
//               : 'bg-gray-200 text-gray-600'
//           }`}>
//             {step < currentStep ? <CheckCircle size={20} /> : step}
//           </div>
//           {step < 4 && (
//             <div className={`w-16 h-1 ${
//               step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
//             }`} />
//           )}
//         </React.Fragment>
//       ))}
//     </div>
//   );

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         <ProgressIndicator />

//         {errorMessage && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <div className="flex items-center">
//               <AlertTriangle className="text-red-600 mr-2" size={20} />
//               <span className="text-red-800">{errorMessage}</span>
//             </div>
//           </div>
//         )}

//         <div className="mb-8">
//           {currentStep === 1 && renderStep1()}
//           {currentStep === 2 && renderStep2()}
//           {currentStep === 3 && renderStep3()}
//           {currentStep === 4 && renderStep4()}
//         </div>

//         {/* Navigation buttons - doar pentru step-urile 1-3 */}
//         {currentStep < 4 && (
//           <div className="flex justify-between">
//             <button
//               onClick={handlePrevious}
//               disabled={currentStep === 1}
//               className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ArrowLeft className="mr-2" size={16} />
//               Înapoi
//             </button>

//             {currentStep < 3 && (
//               <button
//                 onClick={handleNext}
//                 className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
//               >
//                 Următorul
//                 <ArrowRight className="ml-2" size={16} />
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BookingSystem;
import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Star, Shield, Sparkles, Clock } from 'lucide-react';

// PaymentProcessor component cu CSS-ul tău
const PaymentProcessor = ({ bookingData, paymentMethod, onPaymentSuccess, onPaymentError, isProcessing }) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const handlePayment = async () => {
    // Simulare plată cu succes pentru demo
    setTimeout(() => {
      onPaymentSuccess({
        success: true,
        transactionId: `TXN_${Date.now()}`,
        paymentMethod: paymentMethod,
        bookingId: Math.floor(Math.random() * 1000) + 1,
        booking: { id: Math.floor(Math.random() * 1000) + 1 }
      });
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const renderCardPayment = () => (
    <div className="payment-form">
      <div className="payment-header">
        <h4>
          <CreditCard className="payment-icon" />
          Plată cu Cardul
        </h4>
        <div className="secure-badge">
          <Shield size={16} />
          <span>Securizat SSL</span>
        </div>
      </div>

      <div className="card-form">
        <div className="form-group">
          <label>Numărul cardului *</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardData.cardNumber}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              cardNumber: formatCardNumber(e.target.value)
            }))}
            maxLength="19"
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data expirării *</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={cardData.expiryDate}
              onChange={(e) => setCardData(prev => ({
                ...prev,
                expiryDate: formatExpiryDate(e.target.value)
              }))}
              maxLength="5"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>CVV *</label>
            <input
              type="text"
              placeholder="123"
              value={cardData.cvv}
              onChange={(e) => setCardData(prev => ({
                ...prev,
                cvv: e.target.value.replace(/\D/g, '').substring(0, 4)
              }))}
              maxLength="4"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Numele de pe card *</label>
          <input
            type="text"
            placeholder="NUME PRENUME"
            value={cardData.cardholderName}
            onChange={(e) => setCardData(prev => ({
              ...prev,
              cardholderName: e.target.value.toUpperCase()
            }))}
            className="form-input"
          />
        </div>

        <div className="payment-info">
          <div className="info-item">
            <span>Suma de plată:</span>
            <span className="amount">{bookingData.totalAmount} RON</span>
          </div>
          <div className="security-note">
            🔒 Datele cardului sunt criptate și securizate
          </div>
        </div>
      </div>
    </div>
  );

  const renderCashPayment = () => (
    <div className="payment-form">
      <div className="payment-header">
        <h4>
          <span className="payment-icon">💵</span>
          Plată în Numerar
        </h4>
      </div>
      
      <div className="cash-info">
        <div className="cash-amount">
          <span>Suma de plată:</span>
          <span className="amount">{bookingData.totalAmount} RON</span>
        </div>
        
        <div className="cash-instructions">
          <h5>Instrucțiuni de plată:</h5>
          <ul>
            <li>Plata se efectuează în numerar la finalul serviciului</li>
            <li>Vă rugăm să aveți suma exactă pregătită</li>
            <li>Veți primi bon fiscal pentru plată</li>
            <li>Puteți schimba metoda de plată până cu 24h înainte</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTransferPayment = () => (
    <div className="payment-form">
      <div className="payment-header">
        <h4>
          <span className="payment-icon">🏦</span>
          Transfer Bancar
        </h4>
      </div>
      
      <div className="transfer-info">
        <div className="transfer-amount">
          <span>Suma de plată:</span>
          <span className="amount">{bookingData.totalAmount} RON</span>
        </div>
        
        <div className="bank-details">
          <h5>Detalii bancare:</h5>
          <div className="bank-info">
            <div className="bank-row">
              <span>Beneficiar:</span>
              <span>CURĂȚENIE ECO SRL</span>
            </div>
            <div className="bank-row">
              <span>IBAN:</span>
              <span>RO49 AAAA 1B31 0075 9384 0000</span>
            </div>
            <div className="bank-row">
              <span>Bancă:</span>
              <span>BCR Sucursala Bucuresti</span>
            </div>
            <div className="bank-row">
              <span>Cod BIC:</span>
              <span>RNCBROBU</span>
            </div>
          </div>
          
          <div className="transfer-note">
            <strong>Important:</strong> Vă rugăm să menționați în detaliile transferului:
            <br />
            "Rezervare #{bookingData.id || 'XXXX'} - {bookingData.serviceName}"
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="payment-processor">
      {paymentMethod === 'card' && renderCardPayment()}
      {paymentMethod === 'cash' && renderCashPayment()}
      {paymentMethod === 'transfer' && renderTransferPayment()}
      
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="payment-submit-btn"
      >
        {isProcessing ? (
          <>
            <Loader2 className="spinning" size={16} />
            Procesează rezervarea și plata...
          </>
        ) : (
          <>
            {paymentMethod === 'card' && 'Plătește cu Cardul'}
            {paymentMethod === 'cash' && 'Confirmă Plata în Numerar'}
            {paymentMethod === 'transfer' && 'Confirmă Transferul'}
            <span className="amount-badge">{bookingData.totalAmount} RON</span>
          </>
        )}
      </button>
    </div>
  );
};

// Componenta principală - doar pentru step 3 (plata) și step 4 (confirmare)
const BookingPaymentStep = ({ 
  bookingData, 
  onPaymentSuccess, 
  onPaymentError, 
  onBack 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = (paymentResult) => {
    console.log('✅ Payment success in step component:', paymentResult);
    onPaymentSuccess(paymentResult);
  };

  const handlePaymentError = (error) => {
    console.error('💥 Payment error in step component:', error);
    onPaymentError(error);
  };

  return (
    <div className="payment-step-container">
      {/* Payment Method Selection */}
      <div className="payment-methods-section">
        <h3 className="payment-methods-title">
          <CreditCard size={24} />
          Alege metoda de plată
        </h3>
        
        <div className="payment-methods">
          {[
            { 
              id: 'card', 
              name: 'Card Bancar', 
              icon: CreditCard, 
              description: 'Instant și securizat'
            },
            { 
              id: 'cash', 
              name: 'Numerar', 
              icon: () => <span className="emoji-icon">💵</span>, 
              description: 'La finalul serviciului'
            },
            { 
              id: 'transfer', 
              name: 'Transfer Bancar', 
              icon: () => <span className="emoji-icon">🏦</span>, 
              description: 'Virament bancar'
            }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`payment-method ${paymentMethod === method.id ? 'selected' : ''}`}
            >
              <div className="method-icon">
                {method.icon === CreditCard ? (
                  <CreditCard size={32} />
                ) : (
                  <method.icon />
                )}
              </div>
              <div className="method-name">{method.name}</div>
              <div className="method-description">{method.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Processor */}
      <PaymentProcessor
        bookingData={bookingData}
        paymentMethod={paymentMethod}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        isProcessing={isProcessing}
      />

      {/* Back Button */}
      <div className="step-navigation">
        <button
          onClick={onBack}
          className="btn-back"
        >
          <ArrowLeft size={20} />
          Înapoi la detalii
        </button>
      </div>
    </div>
  );
};

// Componenta pentru success screen
const BookingSuccessStep = ({ bookingResult, bookingData, onNewBooking, onHomePage }) => {
  return (
    <div className="payment-success">
      <div className="success-icon">
        <CheckCircle size={64} />
      </div>
      
      <h3>🎉 Rezervarea Confirmată!</h3>
      <p>Rezervarea dvs. a fost procesată cu succes</p>

      <div className="success-details">
        <div className="details-header">
          <Sparkles size={24} />
          <h4>Detalii Rezervare</h4>
          <Sparkles size={24} />
        </div>
        
        <div className="details-content">
          <div className="detail-highlight">
            <span>Rezervarea №:</span>
            <span className="booking-number">#{bookingResult?.bookingId}</span>
          </div>
          
          <div className="details-grid">
            <div className="detail-item">
              <span>Serviciu:</span>
              <span>{bookingData.serviceName}</span>
            </div>
            <div className="detail-item">
              <span>Data:</span>
              <span>{bookingData.selectedDate}</span>
            </div>
            <div className="detail-item">
              <span>Ora:</span>
              <span>{bookingData.selectedTime}</span>
            </div>
            <div className="detail-item">
              <span>Adresa:</span>
              <span>{bookingData.address}</span>
            </div>
            <div className="detail-item">
              <span>Suma plătită:</span>
              <span className="amount">{bookingData.totalAmount} RON</span>
            </div>
            <div className="detail-item">
              <span>Metoda de plată:</span>
              <span style={{textTransform: 'capitalize'}}>{bookingResult?.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <div className="next-steps-header">
          <Clock size={20} />
          <h4>Ce urmează?</h4>
        </div>
        <ul className="next-steps-list">
          <li>
            <CheckCircle size={16} />
            <span>Veți primi un email de confirmare în câteva minute</span>
          </li>
          <li>
            <CheckCircle size={16} />
            <span>Echipa noastră vă va contacta cu 24h înainte</span>
          </li>
          <li>
            <CheckCircle size={16} />
            <span>Pentru modificări: 0721.234.567</span>
          </li>
        </ul>
      </div>

      <div className="success-actions">
        <button
          onClick={onHomePage}
          className="btn-primary"
        >
          🏠 Prima Pagină
        </button>
        <button
          onClick={onNewBooking}
          className="btn-secondary"
        >
          ✨ Rezervare Nouă
        </button>
      </div>
    </div>
  );
};

// Export componentele pentru a fi folosite în aplicația existentă
export { BookingPaymentStep, BookingSuccessStep, PaymentProcessor };

// Componenta wrapper doar pentru demo
const BookingSystemDemo = () => {
  const [currentView, setCurrentView] = useState('payment'); // 'payment' sau 'success'
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Date demo pentru rezervare
  const bookingData = {
    serviceName: 'Întreținere covoare',
    selectedDate: '2025-07-12',
    selectedTime: '09:00',
    address: 'Pitești, Muntenia',
    phone: '0723927689',
    totalAmount: 200,
    specialInstructions: 'Detalii despre accesul în locuință, cerințe speciale, zone care necesită atenție...'
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log('✅ Payment completed successfully:', paymentResult);
    setBookingResult(paymentResult);
    setCurrentView('success');
    setErrorMessage('');
  };

  const handlePaymentError = (error) => {
    console.error('💥 Payment error:', error);
    setErrorMessage(error);
  };

  const handleBack = () => {
    console.log('Going back to previous step');
    // În aplicația reală, aceasta ar trebui să schimbe step-ul înapoi
  };

  const handleNewBooking = () => {
    setCurrentView('payment');
    setBookingResult(null);
    setErrorMessage('');
  };

  const handleHomePage = () => {
    console.log('Redirecting to home page');
    // window.location.href = '/';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      {errorMessage && (
        <div className="error-message">
          <AlertTriangle size={24} />
          <span>{errorMessage}</span>
        </div>
      )}

      {currentView === 'payment' && (
        <BookingPaymentStep
          bookingData={bookingData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onBack={handleBack}
        />
      )}

      {currentView === 'success' && (
        <BookingSuccessStep
          bookingResult={bookingResult}
          bookingData={bookingData}
          onNewBooking={handleNewBooking}
          onHomePage={handleHomePage}
        />
      )}
    </div>
  );
};

export default BookingSystemDemo;