'use client';
import React from 'react';
import JsonFormatter from './_components/json.formatter';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full px-2 py-8">
          <header className="text-left mb-8 ml-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              JASON Formatter
            </h1>
          </header>

          <div className="bg-white rounded-2xl shadow-xl p-8 ">
            <JsonFormatter />
          </div>
      </div>
    </div>
  );
}