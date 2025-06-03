import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          credentials: 'include', // esențial pentru cookie!
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('user', JSON.stringify(data));
          toast.success('✅ Autentificat cu Google!');
          navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/account');
        } else {
          toast.error('Eroare la preluarea contului.');
          navigate('/login');
        }
      } catch (err) {
        toast.error('Eroare de rețea la autentificare.');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="container py-5 text-center">
      <h4>Autentificare în curs...</h4>
    </div>
  );
}

export default LoginSuccess;
