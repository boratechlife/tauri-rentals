import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface Payment {
  id: string;
  tenant: string;
  unit: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Late';
}

const PaymentManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tenant or unit"
            className="pl-8 pr-4 py-2 border rounded"
            onChange={handleSearch}
          />
          <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
        </div>

        <select
          className="px-4 py-2 border rounded"
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="late">Late</option>
        </select>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Tenant</th>
            <th className="p-2 text-left">Unit</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b">
              <td className="p-2">{payment.tenant}</td>
              <td className="p-2">{payment.unit}</td>
              <td className="p-2">${payment.amount}</td>
              <td className="p-2">{payment.date}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded ${
                    payment.status === 'Paid'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentManagement;
