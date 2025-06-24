import React from 'react';
import {
  Table as NextUITable,
  TableHeader as NextUITableHeader,
  TableColumn as NextUITableColumn,
  TableBody as NextUITableBody,
  TableRow as NextUITableRow,
  TableCell as NextUITableCell
} from "@nextui-org/react";

const Table = ({ 
  children, 
  className = '', 
  isStriped = false,
  isCompact = false,
  removeWrapper = false,
  color = 'default',
  ...props 
}) => {
  return (
    <NextUITable 
      className={className}
      isStriped={isStriped}
      isCompact={isCompact}
      removeWrapper={removeWrapper}
      color={color}
      {...props}
    >
      {children}
    </NextUITable>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <NextUITableHeader className={className} {...props}>
      {children}
    </NextUITableHeader>
  );
};

const TableColumn = ({ children, className = '', ...props }) => {
  return (
    <NextUITableColumn className={className} {...props}>
      {children}
    </NextUITableColumn>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <NextUITableBody className={className} {...props}>
      {children}
    </NextUITableBody>
  );
};

const TableRow = ({ children, className = '', ...props }) => {
  return (
    <NextUITableRow className={className} {...props}>
      {children}
    </NextUITableRow>
  );
};

const TableCell = ({ children, className = '', ...props }) => {
  return (
    <NextUITableCell className={className} {...props}>
      {children}
    </NextUITableCell>
  );
};

export { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell };