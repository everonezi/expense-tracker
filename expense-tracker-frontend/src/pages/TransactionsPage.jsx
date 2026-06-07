import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import client from '../api/client'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

const EMPTY_FORM = {
  amount: '',
  type: 'EXPENSE',
  date: new Date().toISOString().split('T')[0],
  description: '',
  categoryId: '',
  accountId: '',
}

export default function TransactionsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      client.get(`/transactions?month=${month}&year=${year}`),
      client.get('/categories'),
      client.get('/accounts'),
    ]).then(([tx, cats, accs]) => {
      setTransactions(tx.data)
      setCategories(cats.data)
      setAccounts(accs.data)
    }).finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
    setDialogOpen(true)
  }

  function openEdit(t) {
    setEditId(t.id)
    setForm({
      amount: t.amount,
      type: t.type,
      date: t.date,
      description: t.description || '',
      categoryId: t.categoryId,
      accountId: t.accountId,
    })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount), categoryId: Number(form.categoryId), accountId: Number(form.accountId) }
      editId ? await client.put(`/transactions/${editId}`, payload) : await client.post('/transactions', payload)
      setDialogOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esta transação?')) return
    await client.delete(`/transactions/${id}`)
    load()
  }

  const filteredCategories = categories.filter((c) => c.type === form.type)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Transações</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova transação</Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField select label="Mês" value={month} onChange={(e) => setMonth(Number(e.target.value))} size="small" sx={{ width: 150 }}>
          {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
        </TextField>
        <TextField select label="Ano" value={year} onChange={(e) => setYear(Number(e.target.value))} size="small" sx={{ width: 100 }}>
          {[2024, 2025, 2026, 2027].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
      </Box>

      <Card>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Conta</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Nenhuma transação neste período
                  </TableCell>
                </TableRow>
              ) : transactions.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{t.description || '—'}</TableCell>
                  <TableCell>{t.categoryName}</TableCell>
                  <TableCell>{t.accountName}</TableCell>
                  <TableCell sx={{ color: t.type === 'INCOME' ? 'success.main' : 'error.main' }}>
                    {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: t.type === 'INCOME' ? 'success.main' : 'error.main' }}>
                    {t.type === 'INCOME' ? '+' : '-'}{currency(t.amount)}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" onClick={() => openEdit(t)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}>
              <MenuItem value="EXPENSE">Despesa</MenuItem>
              <MenuItem value="INCOME">Receita</MenuItem>
            </TextField>
            <TextField
              label="Valor (R$)"
              type="number"
              inputProps={{ min: 0.01, step: 0.01 }}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <TextField
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Descrição"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField select label="Categoria" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {filteredCategories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Conta" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
              {accounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
