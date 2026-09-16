import React from 'react';

export default function LoadingState({ message = 'লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-[#1c398e] animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-blue-50" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
