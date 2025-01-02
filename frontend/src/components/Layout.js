import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../authContext';
import { Helmet } from 'react-helmet';

const Layout = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <title>Inquisitiv</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossOrigin="anonymous" />
                <link href="/static/favicon.ico" rel="icon" />
                <link href="/static/styles.css" rel="stylesheet" />
            </Helmet>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossOrigin="anonymous"></script>
            <nav className="bg-light border navbar navbar-expand-md navbar-light">
                <div className="container-fluid">
                    
                    <Link className="navbar-brand" to="/">
                        <img src="/static/inquisitiv.png" width="212" height="118" alt="Inquisitiv Logo" />
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbar"
                        aria-controls="navbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbar">
                        {isAuthenticated ? (
                            <>
                                <ul className="navbar-nav me-auto mt-2">
                                    <li className="nav-item">
                                        <NavLink to="/upload" className="nav-link">
                                            Upload PDF
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/public_folders" className="nav-link">
                                            Explore Folders
                                        </NavLink>
                                    </li>
                                </ul>
                                <ul className="navbar-nav ms-auto mt-2">
                                    <li className="nav-item">
                                        <NavLink to="/change_password" className="nav-link">
                                            Change Password
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link btn btn-link" onClick={logout}>
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            </>
                        ) : (
                            <ul className="navbar-nav ms-auto mt-2">
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link">
                                        Register
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/login" className="nav-link">
                                        Log In
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </nav>

            {/* Flash messages can be handled with a library like react-toastify */}
            <main className="container-fluid py-5 text-center">{children}</main>

            <footer className="mb-5 small text-center text-muted">
                Data provided by <a href="https://iexcloud.io/">IEX</a>
            </footer>
        </>
    );
};

export default Layout;
