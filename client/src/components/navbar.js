import { useContext, useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { auth, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const activeLinkStyle = { color: '#60a5fa' }; // blue-400

  const primaryLinks = [
    { to: "/", text: "Home" },
  ];
  if (auth.token && auth.role === 'user') {
    primaryLinks.push({ to: "/my-complaints", text: "My Complaints" });
  }

  const secondaryLinks = [
    { to: "/profile", text: "User Profile", auth: true },
    { to: "/contact", text: "Contact Us" },
    { to: "/help", text: "Help" },
    { to: "/privacy", text: "Privacy Policy" },
    { to: "/about", text: "About Us" },
  ];

  const renderLinks = (links) => {
    return links.map(link => {
      if (link.auth && !auth.token) return null;
      return (
        <NavLink 
          key={link.to} 
          to={link.to} 
          style={({ isActive }) => isActive ? activeLinkStyle : undefined} 
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={closeMenu}
        >
          {link.text}
        </NavLink>
      );
    });
  };

  return (
    <nav className="bg-gray-900 shadow-md sticky top-0 z-50">
      <div>
        <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-400">FixMyCity</Link>
          </div>

          <div className="flex items-center">
            {/* Desktop Primary Links */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {renderLinks(primaryLinks)}
              </div>
            </div>

            {/* Hamburger Button & Dropdown */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-controls="hamburger-menu"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open menu</span>
                {isOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
              </button>

              {/* Dropdown Menu */}
              <div 
                id="hamburger-menu"
                className={`absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} transform origin-top-right`}
              >
                {/* Mobile Menu Links */}
                <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {renderLinks(primaryLinks)}
                  {renderLinks(secondaryLinks)}
                </div>
                {/* Desktop Secondary Links */}
                <div className="hidden md:block px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {renderLinks(secondaryLinks)}
                </div>

                {/* Auth buttons */}
                <div className="border-t border-gray-700 pt-4 pb-3">
                  {auth.token ? (
                    <div className="px-2 space-y-1">
                       <button onClick={() => { logout(); closeMenu(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Logout</button>
                    </div>
                  ) : (
                    <div className="px-2 space-y-1">
                      <NavLink to="/login" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700" onClick={closeMenu}>Login</NavLink>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}