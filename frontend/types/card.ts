import React from 'react';

const sizeMap = {
  sm: 'card-sm',
  md: 'card-md',
  lg: 'card-lg',
} as const;

const styleMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
} as const;

export type CardSize = keyof typeof sizeMap;
export type CardActionStyle = keyof typeof styleMap;

export interface CardAction {
  label: string;
  method?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  style?: CardActionStyle;
  fullWidth?: boolean;
}

export interface CardProps {
  size?: CardSize;
  title?: string;
  children?: React.ReactNode;
  actions?: CardAction[];
}

export { sizeMap, styleMap };
