import React from 'react';
import {
  Modal as NextUIModal,
  ModalContent,
  ModalHeader as NextUIModalHeader,
  ModalBody as NextUIModalBody,
  ModalFooter as NextUIModalFooter,
  useDisclosure
} from "@nextui-org/react";

// Wrapper component to maintain compatibility with existing code
const Modal = ({ isOpen, onClose, children, size = 'md', className = '', ...props }) => {
  return (
    <NextUIModal 
      isOpen={isOpen} 
      onClose={onClose}
      size={size}
      className={className}
      {...props}
    >
      <ModalContent>
        {children}
      </ModalContent>
    </NextUIModal>
  );
};

// Wrapper components to maintain compatibility with existing code
const ModalHeader = ({ children, onClose, className = '', ...props }) => {
  return (
    <NextUIModalHeader className={className} {...props}>
      {children}
    </NextUIModalHeader>
  );
};

const ModalBody = ({ children, className = '', ...props }) => {
  return (
    <NextUIModalBody className={className} {...props}>
      {children}
    </NextUIModalBody>
  );
};

const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <NextUIModalFooter className={className} {...props}>
      {children}
    </NextUIModalFooter>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure };