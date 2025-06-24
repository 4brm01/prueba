import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import UserInfo from '../auth/UserInfo';
import { Navbar, NavbarBrand, NavbarContent, Button } from "@nextui-org/react";
import { SunIcon, MoonIcon } from './Icons';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const Header = ({ onShowLogin }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, handleLogout } = useAuth();
  const isOnline = useOnlineStatus();

  return (
    <Navbar 
      className="shadow-sm border-b" 
      maxWidth="full" 
      position="static"
    >
      <NavbarBrand>
        <div className="flex items-center gap-3">
          <span className="text-2xl">💉</span>
          <div>
            <p className="font-semibold text-inherit text-lg">Sistema de Vacunación</p>
            <p className="text-xs text-default-500">Gestión integral de centros de vacunación y pacientes</p>
          </div>
        </div>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-3">
        {/* Estado de conexión online/offline */}
        <div title={isOnline ? 'Conectado' : 'Sin conexión'}
             className={`flex items-center mr-2`}>
          <span
            className={`inline-block w-3 h-3 rounded-full border border-gray-300 ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
            style={{ boxShadow: isOnline ? '0 0 4px #22c55e' : '0 0 4px #ef4444' }}
          ></span>
          <span className="ml-1 text-xs text-default-500 select-none">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <UserInfo 
          user={currentUser}
          onLogout={handleLogout}
          onShowLogin={onShowLogin}
        />
        <Button
          isIconOnly
          variant="light"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="text-default-500 hover:text-primary"
        >
          {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </Button>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;