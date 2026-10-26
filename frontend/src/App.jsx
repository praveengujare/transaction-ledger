import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowDownLeft, ArrowUpRight, Wallet, Plus, RefreshCw, ChevronLeft, ChevronRight, CircleAlert, CheckCircle2 } from 'lucide-react';
import api, { readableError } from './api';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0));
const dateTime = (value) => value ? new Date(value).toLocaleString() : '—';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [history, setHistory] = useState({ content: [], currentPage: 0, pageSize: 10, totalRecords: 0, totalPages: 0 });
  const [balance, setBalance] = useState(0);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [tx, setTx] = useState({ type: 'CREDIT', amount: '', description: '', referenceId: '' });

  const notify = (kind, message) => {
    setNotice({ kind, message });
    window.setTimeout(() => setNotice(null), 4500);
  };

  const loadAccounts = useCallback(async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
      setAccountId(current => {
        if (current && response.data.some(a => String(a.id) === String(current))) return current;
        return response.data.length ? String(response.data[0].id) : '';
      });
    } catch (e) { notify('error', `Could not load accounts: ${readableError(e)}`); }
  }, []);

  const loadLedger = useCallback(async () => {
    if (!accountId) { setHistory({ content: [], currentPage: 0, pageSize: 10, totalRecords: 0, totalPages: 0 }); setBalance(0); return; }
    setBusy(true);
    try {
      const [b, h] = await Promise.all([
        api.get(`/accounts/${accountId}/balance`),
        api.get(`/accounts/${accountId}/transactions`, { params: { ...(filter ? { type: filter } : {}), page, limit: 10 } })
      ]);
      setBalance(Number(b.data.balance));
      setHistory(h.data);
    } catch (e) { notify('error', readableError(e)); }
    finally { setBusy(false); }
  }, [accountId, filter, page]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);
  useEffect(() => { loadLedger(); }, [loadLedger]);

  async function createAccount(event) {
    event.preventDefault();
    if (!accountName.trim()) return;
    try {
      const response = await api.post('/accounts', { name: accountName.trim() });
      setAccountName('');
      notify('success', `Account “${response.data.name}” created.`);
      await loadAccounts();
      setAccountId(String(response.data.id));
      setPage(0);
    } catch (e) { notify('error', readableError(e)); }
  }

  async function submitTransaction(event) {
    event.preventDefault();
    if (!accountId) return notify('error', 'Create or select an account first.');
    try {
      await api.post(`/accounts/${accountId}/transactions`, {
        type: tx.type, amount: Number(tx.amount), description: tx.description.trim(), referenceId: tx.referenceId.trim()
      });
      notify('success', `${tx.type === 'CREDIT' ? 'Credit' : 'Debit'} transaction recorded.`);
      setTx({ type: 'CREDIT', amount: '', description: '', referenceId: '' });
      setPage(0);
      await loadLedger();
      await loadAccounts();
    } catch (e) { notify('error', readableError(e)); }
  }

  const credits = history.content.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + Number(t.amount), 0);
  const debits = history.content.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + Number(t.amount), 0);
  const selected = accounts.find(a => String(a.id) === String(accountId));

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={21}/></div><div><strong>LedgerFlow</strong><span>TRANSACTION LEDGER</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-item active"><Wallet size={18}/> Overview</button>
      <div className="sidebar-note"><div className="status-dot"/><div><strong>Ledger API</strong><span>Connects to your local backend</span></div></div>
      <div className="side-footer">FULL STACK ASSESSMENT<br/><span>Spring Boot · React · MySQL</span></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div><div className="eyebrow">YOUR FINANCES / OVERVIEW</div><h1>Transaction ledger</h1><p>Manage accounts and keep every transaction in sync.</p></div><button className="icon-button" onClick={() => { loadAccounts(); loadLedger(); }} title="Refresh"><RefreshCw size={17}/></button></header>

      {notice && <div className={`notice ${notice.kind}`}><span>{notice.kind === 'success' ? <CheckCircle2 size={18}/> : <CircleAlert size={18}/>}</span>{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}

      <section className="summary-grid">
        <div className="summary-card balance-card"><div className="summary-top"><span>Current balance</span><span className="summary-icon"><Wallet size={19}/></span></div><div className="big-number">{money(balance)}</div><div className="summary-foot">{selected ? selected.name : 'Select an account'} <span className="live-pill">LIVE</span></div></div>
        <div className="summary-card"><div className="summary-top"><span>Credits on this page</span><span className="summary-icon green"><ArrowDownLeft size={19}/></span></div><div className="big-number">{money(credits)}</div><div className="summary-foot">Incoming funds · visible page</div></div>
        <div className="summary-card"><div className="summary-top"><span>Debits on this page</span><span className="summary-icon red"><ArrowUpRight size={19}/></span></div><div className="big-number">{money(debits)}</div><div className="summary-foot">Outgoing funds · visible page</div></div>
        <div className="summary-card"><div className="summary-top"><span>Transactions</span><span className="summary-icon purple"><Activity size={19}/></span></div><div className="big-number">{history.totalRecords}</div><div className="summary-foot">Matching records</div></div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading"><div><h2>Account</h2><p>Create an account or choose one to view.</p></div><span className="section-number">01</span></div>
          <form onSubmit={createAccount} className="stack-form">
            <label htmlFor="accountName">Account holder name</label>
            <div className="input-with-icon"><Wallet size={17}/><input id="accountName" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="e.g. Praveen Gujare" maxLength="120" required/></div>
            <button className="button primary" type="submit"><Plus size={17}/> Create account</button>
          </form>
          <div className="field-divider"/>
          <label htmlFor="accountSelect">Active account</label>
          <select id="accountSelect" className="field" value={accountId} onChange={e => { setAccountId(e.target.value); setPage(0); }}><option value="">Select an account</option>{accounts.map(a => <option key={a.id} value={a.id}>#{a.id} · {a.name}</option>)}</select>
          {selected && <div className="account-meta"><span>Account ID</span><strong>#{selected.id}</strong><span>Created</span><strong>{dateTime(selected.createdAt)}</strong></div>}
        </div>

        <div className="panel">
          <div className="panel-heading"><div><h2>New transaction</h2><p>Post a credit or debit to the selected account.</p></div><span className="section-number">02</span></div>
          <form onSubmit={submitTransaction} className="stack-form">
            <label>Transaction type</label>
            <div className="type-switch"><button type="button" className={tx.type === 'CREDIT' ? 'type-option selected credit' : 'type-option'} onClick={() => setTx({ ...tx, type: 'CREDIT' })}><ArrowDownLeft size={17}/> Credit</button><button type="button" className={tx.type === 'DEBIT' ? 'type-option selected debit' : 'type-option'} onClick={() => setTx({ ...tx, type: 'DEBIT' })}><ArrowUpRight size={17}/> Debit</button></div>
            <div className="two-fields"><div><label htmlFor="amount">Amount (₹)</label><input className="field" id="amount" type="number" min="0.01" step="0.01" value={tx.amount} onChange={e => setTx({ ...tx, amount: e.target.value })} placeholder="0.00" required/></div><div><label htmlFor="reference">Reference ID</label><input className="field" id="reference" value={tx.referenceId} onChange={e => setTx({ ...tx, referenceId: e.target.value })} placeholder="REF-001" maxLength="100" required/></div></div>
            <label htmlFor="description">Description</label><input className="field" id="description" value={tx.description} onChange={e => setTx({ ...tx, description: e.target.value })} placeholder="What is this transaction for?" maxLength="255" required/>
            <button className={`button ${tx.type === 'CREDIT' ? 'primary' : 'debit-button'}`} type="submit" disabled={!accountId}><span>{tx.type === 'CREDIT' ? <ArrowDownLeft size={17}/> : <ArrowUpRight size={17}/>}</span> Submit {tx.type.toLowerCase()}</button>
            <p className="helper-text">Duplicate references are blocked per account. Debits cannot exceed the available balance.</p>
          </form>
        </div>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-heading history-heading"><div><h2>Transaction history</h2><p>Latest transactions appear first.</p></div><div className="history-controls"><select className="filter-select" value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }}><option value="">All types</option><option value="CREDIT">Credits</option><option value="DEBIT">Debits</option></select><button className="icon-button small" onClick={loadLedger} title="Refresh history"><RefreshCw size={15}/></button></div></div>
        <div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>REFERENCE</th><th>DATE & TIME</th><th>TYPE</th><th className="align-right">AMOUNT</th></tr></thead><tbody>
          {history.content.map(t => <tr key={t.id}><td><div className="transaction-title"><span className={`tx-icon ${t.type.toLowerCase()}`}>{t.type === 'CREDIT' ? <ArrowDownLeft size={17}/> : <ArrowUpRight size={17}/>}</span><span><strong>{t.description}</strong><small>TXN-{t.id}</small></span></div></td><td><code>{t.referenceId}</code></td><td className="date-cell">{dateTime(t.createdAt)}</td><td><span className={`type-badge ${t.type.toLowerCase()}`}>{t.type}</span></td><td className={`align-right amount-cell ${t.type === 'CREDIT' ? 'positive' : 'negative'}`}>{t.type === 'CREDIT' ? '+' : '−'}{money(t.amount)}</td></tr>)}
          {!history.content.length && <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon"><Activity size={23}/></div><strong>{accountId ? 'No transactions yet' : 'Choose or create an account'}</strong><span>{accountId ? 'Create a credit or debit transaction to see it here.' : 'Your account history will appear here.'}</span></div></td></tr>}
        </tbody></table></div>
        <div className="pagination"><span>Showing <strong>{history.content.length ? page * 10 + 1 : 0}–{Math.min((page + 1) * 10, history.totalRecords)}</strong> of <strong>{history.totalRecords}</strong> records</span><div className="page-actions"><button className="page-button" disabled={page <= 0 || busy} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16}/> Previous</button><span className="page-count">{history.totalPages ? page + 1 : 0} / {history.totalPages}</span><button className="page-button" disabled={page + 1 >= history.totalPages || busy} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={16}/></button></div></div>
      </section>
      <footer className="app-footer"><span>LedgerFlow <span className="footer-dot">•</span> Transaction Ledger Assessment</span><span>Spring Boot API <span className="footer-dot">•</span> MySQL persistence</span></footer>
    </main>
  </div>;
}
