import React from 'react';
import { Tabs as NextUITabs, Tab as NextUITab } from "@nextui-org/react";

const Tabs = ({ 
  children, 
  selectedKey, 
  onSelectionChange, 
  className = '', 
  variant = 'solid',
  color = 'primary',
  ...props 
}) => {
  return (
    <NextUITabs 
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      className={className}
      variant={variant}
      color={color}
      {...props}
    >
      {children}
    </NextUITabs>
  );
};

const Tab = ({ 
  title, 
  children,
  key,
  className = '',
  ...props 
}) => {
  return (
    <NextUITab 
      key={key} 
      title={title}
      className={className}
      {...props}
    >
      {children}
    </NextUITab>
  );
};

export { Tabs, Tab };