import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './UserSidebar.css';

function UserSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className={`user-sidebar ${open ? 'open' : ''}`}>
      <button className="sidebar-toggle d-md-none" onClick={() => setOpen(!open)}>
        ☰
      </button>
      <div className="sidebar-content">
        <h5 className="sidebar-title">👤 Contul Meu</h5>
        <ul className="nav flex-column">
          <li><NavLink end to="" activeclassname="active"><i className="fa fa-home"></i> Dashboard</NavLink></li>
          <li><NavLink to="orders"><i className="fa fa-box"></i> Comenzi Produse</NavLink></li>
          <li><NavLink to="bookings"><i className="fa fa-calendar-check"></i> Programări</NavLink></li>
          <li><NavLink to="support"><i className="fa fa-headset"></i> Asistență</NavLink></li>
          <li><NavLink to="profile"><i className="fa fa-user-cog"></i> Profil</NavLink></li>
        </ul>
      </div>
    </aside>
  );
}

export default UserSidebar;
