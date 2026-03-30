'use client';

import { CardProps, sizeMap, styleMap } from '@/types/card';

export default function Card({ size = 'md', title, children, actions }: CardProps) {
  return (
    <div className={`card ${sizeMap[size]} card-border bg-base-200 w-96 shadow-md`}>
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {actions && actions.length > 0 && (
          <div className="card-actions justify-end pt-4">
            {actions.map((action) => (
              <button
                key={action.label}
                type={action.type ?? 'button'}
                className={`btn ${styleMap[action.style ?? 'primary']} ${action.fullWidth ? 'w-full' : ''}`}
                onClick={action.method}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
