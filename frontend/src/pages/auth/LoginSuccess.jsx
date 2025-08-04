import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // ✅

function LoginSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth(); // ✅

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          toast.error('Token lipsă din URL');
          navigate('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(data));

          await checkAuth(); // ✅ UPDATEAZĂ CONTEXTUL

          toast.success('✅ Autentificat cu Google!');
          navigate(data.role === 'admin' ? '/admin/dashboard' : '/account');
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
  }, [navigate, searchParams, checkAuth]);

  return (
    <div className="container py-5 text-center">
      <h4>Autentificare în curs...</h4>
    </div>
  );
}

export default LoginSuccess;
