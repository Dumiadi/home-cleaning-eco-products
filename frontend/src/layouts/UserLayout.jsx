import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTopButton from '../components/ScrollToTopButton';

const UserLayout = () => (
  <>
    <Navbar />
    <div className="container-fluid p-0">
      <Outlet />
    </div>
    <Footer />
    <ScrollToTopButton />
  </>
);

export default UserLayout;
