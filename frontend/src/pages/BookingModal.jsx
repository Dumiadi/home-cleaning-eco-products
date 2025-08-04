import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentProcessor from '../components/PaymentProcessor';
import './BookingModal.css';


const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  // State pentru form
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Details, 3: Payment, 4: Confirmation
  const [bookingData, setBookingData] = useState({
    serviceId: service?.id,
    selectedDate: '',
    selectedTime: '',
    duration: service?.duration || 120,
    address: '',
    phone: '',
    specialInstructions: '',
    contactMethod: 'phone', // phone, email, whatsapp
    urgency: 'normal', // urgent, normal, flexible
    additionalServices: [],
    totalAmount: service?.price || 0
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  // State pentru plată
  const [paymentResult, setPaymentResult] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Context hooks
  const { user } = useAuth();

  // Debug logs
  useEffect(() => {
    console.log('BookingData updated:', bookingData);
  }, [bookingData]);

  useEffect(() => {
    console.log('Available slots:', availableSlots);
  }, [availableSlots]);

  // Prefill user data
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  // Fetch available slots când se schimbă data
  useEffect(() => {
    if (bookingData.selectedDate && service?.id) {
      fetchAvailableSlots();
      // ✅ RESETEAZĂ TIMPUL SELECTAT când se schimbă data
      if (bookingData.selectedTime) {
        setBookingData(prev => ({ ...prev, selectedTime: '' }));
      }
    }
  }, [bookingData.selectedDate, service?.id]);

  // Recalculează totalul când se schimbă servicii sau urgența
  useEffect(() => {
    calculateTotal();
  }, [bookingData.additionalServices, bookingData.urgency]);

  const fetchAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(`http://localhost:5000/api/services/${service.id}/slots?date=${bookingData.selectedDate}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ API Response for slots:', data);
        setAvailableSlots(data.slots || []);
        
        // ✅ Log statistici dacă sunt disponibile
        if (data.statistics) {
          console.log(`📊 Slot Statistics - Available: ${data.statistics.available_slots}/${data.statistics.total_slots} (${data.statistics.occupancy_rate}% ocupat)`);
        }
      } else {
        console.error('❌ Failed to fetch slots from server, using fallback');
        setAvailableSlots(generateAllTimeSlots());
      }
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
      setAvailableSlots(generateAllTimeSlots());
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // ✅ NOUĂ FUNCȚIE: Marchează slotul ca rezervat pe server
  const markSlotAsBooked = async (date, time) => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${service.id}/slots/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: date,
          time: time,
          booking_data: {
            ...bookingData,
            serviceName: service.name,
            serviceCategory: service.category,
            paymentMethod: selectedPaymentMethod,
            paymentStatus: selectedPaymentMethod === 'cash' ? 'pending' : 'paid'
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Verifică dacă este conflict de double-booking
        if (response.status === 409) {
          throw new Error('Acest slot a fost rezervat de altcineva între timp. Te rugăm să alegi alt slot.');
        }
        throw new Error(result.message || 'Eroare la rezervarea slotului');
      }
      
      console.log('✅ Slot marcat ca rezervat pe server:', result);
      
      // ✅ REÎMPROSPĂTEAZĂ SLOTURILE DE LA SERVER pentru sincronizare
      await fetchAvailableSlots();
      
      return result;
      
    } catch (error) {
      console.error('❌ Error marking slot as booked:', error);
      throw error;
    }
  };

  // Generează toate slot-urile pentru fallback
  const generateAllTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Validare step
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!bookingData.selectedDate) newErrors.selectedDate = 'Selectează o dată';
      if (!bookingData.selectedTime) newErrors.selectedTime = 'Selectează o oră';
    }

    if (stepNumber === 2) {
      if (!bookingData.address.trim()) newErrors.address = 'Adresa este obligatorie';
      if (!bookingData.phone.trim()) newErrors.phone = 'Telefonul este obligatoriu';
      if (bookingData.phone && !/^[0-9+\-\s()]{10,}$/.test(bookingData.phone)) {
        newErrors.phone = 'Formatul telefonului nu este valid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    
    // ✅ PREVINE SELECTAREA SLOTURILOR INDISPONIBILE
    if (field === 'selectedTime') {
      const slot = generateTimeSlots().find(s => s.time === value);
      if (slot && (!slot.available || slot.recentlyBooked)) {
        console.log('Cannot select unavailable or recently booked slot:', value);
        return; // Nu permite selectarea
      }
    }
    
    setBookingData(prev => ({ ...prev, [field]: value }));
    
    // Clear error pentru field-ul actualizat
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Calculează totalul
  const calculateTotal = () => {
    let total = service?.price || 0;
    
    // Adaugă costul serviciilor adiționale
    bookingData.additionalServices.forEach(() => {
      total += 50; // +50 RON per serviciu adițional
    });

    // Factor de urgență
    if (bookingData.urgency === 'urgent') {
      total *= 1.2; // +20% pentru urgență
    }

    setBookingData(prev => ({ ...prev, totalAmount: Math.round(total) }));
  };

  // Next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  // Previous step
  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  // Handler pentru succes plată
  const handlePaymentSuccess = async (result) => {
    console.log('Payment successful:', result);
    setPaymentResult(result);
    
    try {
      // ✅ MARCHEAZĂ SLOTUL CA REZERVAT PE SERVER (cu toate datele)
      const bookingResult = await markSlotAsBooked(bookingData.selectedDate, bookingData.selectedTime);
      
      if (bookingResult.success) {
        // ✅ ACTUALIZEAZĂ LOCAL SLOTURILE DISPONIBILE
        const updatedSlots = availableSlots.filter(slot => slot !== bookingData.selectedTime);
        setAvailableSlots(updatedSlots);
        
        setStep(4); // Success step
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        throw new Error(bookingResult.message || 'Eroare la crearea rezervării');
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      
      // ✅ GESTIONEAZĂ DIFERITE TIPURI DE ERORI
      if (error.message.includes('rezervat de altcineva')) {
        setErrors({ 
          submit: '⚠️ Acest slot a fost rezervat de altcineva între timp. Te rugăm să alegi alt slot și să încerci din nou.' 
        });
        // Reîncarcă sloturile pentru a arăta situația actuală
        await fetchAvailableSlots();
        // Resetează timpul selectat
        setBookingData(prev => ({ ...prev, selectedTime: '' }));
        // Întoarce la pasul 1 pentru a selecta alt slot
        setStep(1);
      } else {
        setErrors({ submit: error.message });
      }
      
      setIsPaymentProcessing(false);
    }
  };

  // Handler pentru eroare plată
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setErrors({ payment: error });
    setIsPaymentProcessing(false);
  };

  // Generează time slots cu logică îmbunătățită
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // ✅ VERIFICĂ DISPONIBILITATEA: 
        // 1. Dacă nu avem date de la server, consideră toate disponibile
        // 2. Dacă avem date, verifică dacă slot-ul este în lista disponibilă
        // 3. Verifică dacă slotul nu a fost rezervat local (pentru UX instant)
        const isAvailable = availableSlots.length === 0 || availableSlots.includes(timeString);
        
        slots.push({ 
          time: timeString, 
          available: isAvailable,
          // ✅ MARCHEAZĂ SLOTUL CA RECENTLY BOOKED dacă tocmai a fost rezervat
          recentlyBooked: bookingData.selectedTime === timeString && step === 4
        });
      }
    }
    console.log('Generated slots:', slots);
    return slots;
  };

  // Получить минимальную дату (завтра)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Получить максимальную дату (3 месяца вперед)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="booking-modal-header">
          <div className="modal-title">
            <h2>Rezervă Serviciu</h2>
            <p>{service?.name}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="booking-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            {[1, 2, 3, 4].map(stepNum => (
              <div 
                key={stepNum}
                className={`progress-step ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}
              >
                {stepNum}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="booking-modal-content">
          
          {/* Step 1: Date & Time Selection */}
          {step === 1 && (
            <div className="booking-step">
              <h3>
                <Calendar className="step-icon" />
                Alege Data și Ora
              </h3>
              
              <div className="date-time-selection">
                {/* Date picker */}
                <div className="form-group">
                  <label htmlFor="booking-date">Data serviciului *</label>
                  <input
                    type="date"
                    id="booking-date"
                    value={bookingData.selectedDate}
                    onChange={(e) => handleInputChange('selectedDate', e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={`form-input ${errors.selectedDate ? 'error' : ''}`}
                  />
                  {errors.selectedDate && (
                    <span className="error-message">{errors.selectedDate}</span>
                  )}
                </div>

                {/* Time Slots */}
                {bookingData.selectedDate && (
                  <div className="form-group">
                    <label>Ora serviciului *</label>
                    {isLoadingSlots ? (
                      <div className="loading-slots">Se încarcă orele disponibile...</div>
                    ) : (
                      <div className="time-slots">
                        {generateTimeSlots().map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Time slot clicked:', slot.time);
                              handleInputChange('selectedTime', slot.time);
                            }}
                            disabled={!slot.available}
                            className={`time-slot ${
                              bookingData.selectedTime === slot.time ? 'selected' : ''
                            } ${!slot.available ? 'disabled' : ''} ${
                              slot.recentlyBooked ? 'recently-booked' : ''
                            } clickable`}
                            title={
                              !slot.available 
                                ? 'Acest slot nu este disponibil' 
                                : slot.recentlyBooked 
                                  ? 'Tocmai rezervat'
                                  : 'Click pentru a selecta'
                            }
                          >
                            {slot.time}
                            {/* ✅ INDICATOR PENTRU SLOT TOCMAI REZERVAT */}
                            {slot.recentlyBooked && (
                              <span className="recently-booked-indicator">📅</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.selectedTime && (
                      <span className="error-message">{errors.selectedTime}</span>
                    )}
                  </div>
                )}

                {/* Urgency */}
                <div className="form-group">
                  <label>Urgența serviciului</label>
                  <div className="urgency-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="urgency"
                        value="flexible"
                        checked={bookingData.urgency === 'flexible'}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                      />
                      <span>Flexibil</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="urgency"
                        value="normal"
                        checked={bookingData.urgency === 'normal'}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                      />
                      <span>Normal</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="urgency"
                        value="urgent"
                        checked={bookingData.urgency === 'urgent'}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                      />
                      <span>Urgent (+20%)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button type="button" className="btn-primary" onClick={handleNext}>
                  Continuă <Clock className="btn-icon" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <div className="booking-step">
              <h3>
                <User className="step-icon" />
                Detalii Contact și Adresă
              </h3>

              <div className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="booking-phone">Telefon *</label>
                    <div className="input-with-icon">
                      <Phone className="input-icon" />
                      <input
                        type="tel"
                        id="booking-phone"
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0700 000 000"
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-method">Metoda preferată de contact</label>
                    <select
                      id="contact-method"
                      value={bookingData.contactMethod}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      className="form-select"
                    >
                      <option value="phone">Telefon</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="booking-address">Adresa serviciului *</label>
                  <div className="input-with-icon">
                    <MapPin className="input-icon" />
                    <textarea
                      id="booking-address"
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Strada, numărul, etajul, apartamentul, orașul..."
                      rows="3"
                      className={`form-textarea ${errors.address ? 'error' : ''}`}
                    />
                  </div>
                  {errors.address && (
                    <span className="error-message">{errors.address}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="special-instructions">Instrucțiuni speciale (opțional)</label>
                  <textarea
                    id="special-instructions"
                    value={bookingData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Detalii despre accesul în locuință, cerințe speciale, zone care necesită atenție..."
                    rows="3"
                    className="form-textarea"
                  />
                </div>

                {/* Additional Services */}
                <div className="form-group">
                  <label>Servicii adiționale (opțional)</label>
                  <div className="additional-services">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        value="interior-windows"
                        onChange={(e) => {
                          const current = bookingData.additionalServices;
                          if (e.target.checked) {
                            handleInputChange('additionalServices', [...current, e.target.value]);
                          } else {
                            handleInputChange('additionalServices', current.filter(s => s !== e.target.value));
                          }
                        }}
                      />
                      <span>Curățare geamuri interior (+50 RON)</span>
                    </label>
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        value="deep-kitchen"
                        onChange={(e) => {
                          const current = bookingData.additionalServices;
                          if (e.target.checked) {
                            handleInputChange('additionalServices', [...current, e.target.value]);
                          } else {
                            handleInputChange('additionalServices', current.filter(s => s !== e.target.value));
                          }
                        }}
                      />
                      <span>Curățare deep bucătărie (+50 RON)</span>
                    </label>
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        value="balcony"
                        onChange={(e) => {
                          const current = bookingData.additionalServices;
                          if (e.target.checked) {
                            handleInputChange('additionalServices', [...current, e.target.value]);
                          } else {
                            handleInputChange('additionalServices', current.filter(s => s !== e.target.value));
                          }
                        }}
                      />
                      <span>Curățare balcon/terasă (+50 RON)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button type="button" className="btn-secondary" onClick={handlePrevious}>
                  Înapoi
                </button>
                <button type="button" className="btn-primary" onClick={handleNext}>
                  Continuă <CreditCard className="btn-icon" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Confirmation */}
          {step === 3 && (
            <div className="booking-step">
              <h3>
                <CreditCard className="step-icon" />
                Confirmare și Plată
              </h3>

              {/* Booking Summary */}
              <div className="booking-summary">
                <h4>Rezumatul rezervării</h4>
                
                <div className="summary-item">
                  <span>Serviciu:</span>
                  <span>{service?.name}</span>
                </div>
                
                <div className="summary-item">
                  <span>Data și ora:</span>
                  <span>{bookingData.selectedDate} la {bookingData.selectedTime}</span>
                </div>
                
                <div className="summary-item">
                  <span>Durată estimată:</span>
                  <span>{Math.floor(bookingData.duration / 60)}h {bookingData.duration % 60}min</span>
                </div>
                
                <div className="summary-item">
                  <span>Adresa:</span>
                  <span>{bookingData.address}</span>
                </div>

                {bookingData.additionalServices.length > 0 && (
                  <div className="summary-item">
                    <span>Servicii adiționale:</span>
                    <span>{bookingData.additionalServices.length} servicii</span>
                  </div>
                )}

                <div className="summary-total">
                  <span>Total de plată:</span>
                  <span className="total-amount">{bookingData.totalAmount} RON</span>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="payment-section">
                <h4>Metoda de plată</h4>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPaymentMethod === 'card'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <span>💳 Card de credit/debit</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={selectedPaymentMethod === 'cash'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <span>💵 Numerar la finalul serviciului</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={selectedPaymentMethod === 'transfer'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <span>🏦 Transfer bancar</span>
                  </label>
                </div>
              </div>

              {/* Payment Processor Component */}
              <PaymentProcessor
                bookingData={{
                  ...bookingData,
                  serviceName: service?.name,
                  id: 'new_booking'
                }}
                paymentMethod={selectedPaymentMethod}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isProcessing={isPaymentProcessing}
                setIsProcessing={setIsPaymentProcessing}
              />

              {/* Terms */}
              <div className="terms-section">
                <label className="checkbox-option">
                  <input type="checkbox" required />
                  <span>
                    Sunt de acord cu <a href="/terms" target="_blank">termenii și condițiile</a> și 
                    <a href="/privacy" target="_blank"> politica de confidențialitate</a>
                  </span>
                </label>
              </div>

              {/* Payment Error */}
              {errors.payment && (
                <div className="error-banner">
                  <AlertTriangle className="error-icon" />
                  {errors.payment}
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="error-banner">
                  <AlertTriangle className="error-icon" />
                  {errors.submit}
                </div>
              )}

              <div className="step-actions">
                <button type="button" className="btn-secondary" onClick={handlePrevious}>
                  Înapoi
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="booking-step success-step">
              <div className="success-content">
                <CheckCircle className="success-icon" />
                <h3>Rezervarea a fost confirmată!</h3>
                <p>
                  Mulțumim! Rezervarea ta pentru <strong>{service?.name}</strong> 
                  pe data de <strong>{bookingData.selectedDate}</strong> la ora <strong>{bookingData.selectedTime}</strong> 
                  a fost înregistrată cu succes.
                </p>
                
                {/* Payment Info */}
                {paymentResult && (
                  <div className="payment-confirmation">
                    <h4>Confirmarea plății</h4>
                    <div className="payment-details">
                      <div className="payment-row">
                        <span>Metodă:</span>
                        <span>
                          {paymentResult.paymentMethod === 'card' && '💳 Card'}
                          {paymentResult.paymentMethod === 'cash' && '💵 Numerar'}
                          {paymentResult.paymentMethod === 'transfer' && '🏦 Transfer'}
                        </span>
                      </div>
                      <div className="payment-row">
                        <span>Suma:</span>
                        <span>{bookingData.totalAmount} RON</span>
                      </div>
                      <div className="payment-row">
                        <span>ID Tranzacție:</span>
                        <span className="transaction-id">{paymentResult.transactionId}</span>
                      </div>
                      {paymentResult.note && (
                        <div className="payment-note">
                          <strong>Notă:</strong> {paymentResult.note}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="next-steps">
                  <h4>Ce urmează?</h4>
                  <ul>
                    <li>Vei primi un email de confirmare în câteva minute</li>
                    <li>Te vom contacta cu 24h înainte de serviciu pentru confirmare</li>
                    <li>Poți urmări statusul rezervării în dashboard-ul tău</li>
                    {selectedPaymentMethod === 'transfer' && (
                      <li>Verifică email-ul pentru detaliile transferului bancar</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;