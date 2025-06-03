import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './AdminBreadcrumb.css';  

const AdminBreadcrumb = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(p => p && p !== 'admin');

  const format = (str) => str.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <nav className="breadcrumb-container mb-3">
      <ol className="breadcrumb">
        <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
        {paths.map((p, idx) => (
          <li
            key={idx}
            className={`breadcrumb-item ${idx === paths.length - 1 ? 'active' : ''}`}
            aria-current={idx === paths.length - 1 ? 'page' : undefined}
          >
            {idx === paths.length - 1 ? format(p) : <Link to={`/admin/${paths.slice(0, idx + 1).join('/')}`}>{format(p)}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumb;
