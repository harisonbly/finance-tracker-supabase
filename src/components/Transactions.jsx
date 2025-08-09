// src/components/Transactions.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Intl formatter for INR. Change currencyDisplay to 'code' if you prefer "INR 1,000.00"
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    currencyDisplay: 'symbol', // 'symbol' => ₹, 'code' => INR
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    fetchTransactions();
    const channel = supabase
      .channel(`public:transactions:user=${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setTransactions(data ?? []);
    setLoading(false);
  }

  async function addTransaction(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt)) return alert('Invalid amount');
    const { error } = await supabase.from('transactions').insert([
      {
        user_id: user.id,
        amount: amt,
        category,
        type,
        date,
        notes
      }
    ]);
    if (error) {
      alert(error.message);
      return;
    }
    setAmount('');
    setCategory('');
    setType('expense');
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    fetchTransactions();
  }

  async function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    fetchTransactions();
  }

  const totals = transactions.reduce(
    (acc, t) => {
      const v = parseFloat(t.amount) || 0;
      if (t.type === 'income') acc.income += v;
      else acc.expense += v;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const formatted = {
    income: formatter.format(totals.income),
    expense: formatter.format(totals.expense),
    balance: formatter.format(totals.income - totals.expense),
  };

  return (
    <div>
      <div className="card">
        <h2>Add transaction</h2>
        <form onSubmit={addTransaction}>
          <label>Amount</label>
          <input
            required
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <label>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., groceries" />

          <label>Date</label>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <label>Notes</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="row">
            <button type="submit">Add</button>
            <button type="button" onClick={fetchTransactions}>Refresh</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Summary</h2>
        <div className="summary">
          <div>Income: <strong>{formatted.income}</strong></div>
          <div>Expense: <strong>{formatted.expense}</strong></div>
          <div>Balance: <strong>{formatted.balance}</strong></div>
        </div>
      </div>

      <div className="card">
        <h2>Transactions {loading ? '(loading...)' : ''}</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const v = parseFloat(t.amount) || 0;
                // show negative for expenses so formatter handles sign+currency
                const signed = t.type === 'expense' ? -v : v;
                return (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.type}</td>
                    <td>{t.category}</td>
                    <td className={t.type === 'income' ? 'income' : 'expense'}>
                      {formatter.format(signed)}
                    </td>
                    <td>{t.notes}</td>
                    <td>
                      <button className="danger" onClick={() => deleteTransaction(t.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
