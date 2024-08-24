// /app/ui/dashboard/latest-invoices.jsx
"use client";

import Image from 'next/image';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { lusitana } from '@/app/ui/fonts';
import { useState } from 'react';

export default function LatestInvoices({ latestInvoices }) {
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageError = () => {
    setImageSrc('/default-profile.png');
  };

  if (!latestInvoices || latestInvoices.length === 0) {
    return (
      <div className="flex flex-col w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Latest Invoices
        </h2>
        <div className="flex flex-col justify-between p-4 grow rounded-xl bg-gray-50">
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No invoices available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>
      <div className="flex flex-col justify-between p-4 grow rounded-xl bg-gray-50">
        <div className="px-6 bg-white">
          {latestInvoices.map((invoice, i) => (
            <div
              key={invoice.id}
              className={clsx('flex flex-row items-center justify-between py-4', {
                'border-t': i !== 0,
              })}
            >
              <div className="flex items-center">
                <Image
                  src={invoice.image_url}
                  alt={`${invoice.name}'s profile picture`}
                  width={32}
                  height={32}
                  className="mr-4 rounded-full"
                  onError={handleImageError}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate md:text-base">
                    {invoice.name}
                  </p>
                  <p className="hidden text-sm text-gray-500 sm:block">
                    {invoice.email}
                  </p>
                </div>
              </div>
              <p className={`${lusitana.className} truncate text-sm font-medium md:text-base`}>
                {invoice.amount}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pt-6 pb-2">
          <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
