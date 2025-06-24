import React from 'react';
import {
  Card as NextUICard,
  CardHeader as NextUICardHeader,
  CardBody as NextUICardBody,
  CardFooter as NextUICardFooter
} from "@nextui-org/react";

// Componentes de compatibilidad para mantener el código existente funcionando
const Card = ({ children, className = '', isPressable = false, onPress, ...props }) => {
  return (
    <NextUICard 
      className={className}
      isPressable={isPressable}
      onPress={onPress}
      {...props}
    >
      {children}
    </NextUICard>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <NextUICardHeader className={className} {...props}>
      {children}
    </NextUICardHeader>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <NextUICardBody className={className} {...props}>
      {children}
    </NextUICardBody>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <NextUICardFooter className={className} {...props}>
      {children}
    </NextUICardFooter>
  );
};

export { Card, CardHeader, CardBody, CardFooter };