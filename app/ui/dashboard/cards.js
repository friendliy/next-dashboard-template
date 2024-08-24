// /app/ui/dashboard/cards.jsx
import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export function Card({ title, value, type }) {
  const Icon = iconMap[type];

  return (
    <div className="p-2 shadow-sm rounded-xl bg-gray-50">
      <div className="flex p-4">
        {Icon ? <Icon className="w-5 h-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p className={`${lusitana.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}>
        {value}
      </p>
    </div>
  );
}
