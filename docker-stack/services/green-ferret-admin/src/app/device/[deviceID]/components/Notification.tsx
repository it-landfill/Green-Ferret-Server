'use client';

import React from 'react';

interface Props {
    title?: string;
    message?: string;
}

const Notification = (props: Props) => {
  return (
    <div className="absolute bottom-0 right-0 m-4 ease-in-out transition-all duration-500 transform translate-x-0">
      <div className="flex max-w-md flex-col gap-2 rounded-md p-6 shadow-md shadow-green-600/30">
        <h2 className="leadi tracki flex items-center gap-2 text-xl font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="h-6 w-6 shrink-0 fill-current text-green-600"
          >
            <path d="M451.671,348.569,408,267.945V184c0-83.813-68.187-152-152-152S104,100.187,104,184v83.945L60.329,348.568A24,24,0,0,0,81.432,384h86.944c-.241,2.636-.376,5.3-.376,8a88,88,0,0,0,176,0c0-2.7-.135-5.364-.376-8h86.944a24,24,0,0,0,21.1-35.431ZM312,392a56,56,0,1,1-111.418-8H311.418A55.85,55.85,0,0,1,312,392ZM94.863,352,136,276.055V184a120,120,0,0,1,240,0v92.055L417.137,352Z"></path>
            <rect width="32" height="136" x="240" y="112"></rect>
            <rect width="32" height="32" x="240" y="280"></rect>
          </svg>
          {props.title || 'Notification'}
        </h2>
        <p className="flex-1 text-slate-600">
          {props.message || 'Somenthing happened.'}
        </p>
      </div>
    </div>
  );
};

export default Notification;
