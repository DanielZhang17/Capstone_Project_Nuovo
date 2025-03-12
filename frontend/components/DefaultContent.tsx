'use client';

import { FC } from 'react';

const DefaultContent: FC = () => {
  return (
    <div className="default-content">
      <h1>This is empty content</h1>

      <style jsx>{`
        .default-content {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 2rem;
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default DefaultContent;