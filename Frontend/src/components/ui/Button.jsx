import React from 'react';
import { Button as NextUIButton } from "@nextui-org/react";

// Componente de compatibilidad para mantener el código existente funcionando
const Button = ({ 
  children, 
  onClick, // Mantenemos para compatibilidad
  onPress, // Nuevo prop para NextUI
  className = '', 
  color = 'primary', 
  size = 'md', 
  variant = 'solid',
  isIconOnly = false,
  disabled = false,
  ...props 
}) => {
  // Mapeo de variantes personalizadas a variantes de NextUI
  const variantMap = {
    'solid': 'solid',
    'shadow': 'shadow',
    'outline': 'bordered',
    'ghost': 'light'
  };

  // Mapeo de colores personalizados a colores de NextUI
  const colorMap = {
    'primary': 'primary',
    'secondary': 'secondary',
    'success': 'success',
    'danger': 'danger'
  };

  return (
    <NextUIButton
      className={className}
      color={colorMap[color] || color}
      size={size}
      variant={variantMap[variant] || variant}
      isIconOnly={isIconOnly}
      isDisabled={disabled}
      onPress={onPress || onClick} // Usamos onPress si está disponible, de lo contrario onClick
      {...props}
    >
      {children}
    </NextUIButton>
  );
};

export default Button;