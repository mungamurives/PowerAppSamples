import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { GraphUser_V1 } from '../../generated/models/Office365UsersModel';
import '../../App.css';
import './Header.css';

interface HeaderProps {
    user: GraphUser_V1 | null;
    photo: string;
    error: string;
}

export default function Header({ user, photo, error }: HeaderProps) {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const location = useLocation();

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50); // Change background after scrolling 50px
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className={`header-container ${isScrolled ? 'scrolled' : 'not-scrolled'}`}>
                {error && <div className="error-message">Error: {error}</div>}
                <div className="header-content">
                    <div className="header-title">
                        NextGen Skills
                    </div>
                    {/* Navigation Links and User Image */}
                    <div className="nav-container">
                        <Link
                            to="/all-events"
                            className={`nav-link ${
                                location.pathname === '/all-events' || location.pathname === '/'
                                    ? 'active'
                                    : 'inactive'
                            } ${isScrolled ? 'scrolled' : 'not-scrolled'}`}
                        >
                            All Events
                        </Link>
                        <Link
                            to="/my-events"
                            className={`nav-link ${
                                location.pathname === '/my-events'
                                    ? 'active'
                                    : 'inactive'
                            } ${isScrolled ? 'scrolled' : 'not-scrolled'}`}
                        >
                            My Events
                        </Link>
                        {user && photo && (
                            <img
                                src={photo}
                                alt="User Profile"
                                className={`user-profile-image ${isScrolled ? 'scrolled' : 'not-scrolled'}`}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
} 