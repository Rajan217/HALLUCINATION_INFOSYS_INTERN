import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  hover = false,
  padding = 'p-6',
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft ${
        hover ? 'card-hover' : ''
      } transition-colors duration-200 ${className}`}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
};

export default Card;
