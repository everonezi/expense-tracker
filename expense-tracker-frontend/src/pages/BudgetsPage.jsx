import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import client from '../api/client'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ categoryId: '', limitAmount: '', month: now.getMonth() + 1, year: now.getFullYear() })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      client.get(`/budgets?month=${month}&year=${year}`),
      client.get('/categories'),
    ]).then(([b, c]) => {
      setBudgets(b.data)
      setCategories(c.data.filter((cat) => cat.type === 'EXPENSE'))
    }).finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setForm({ categoryId: '', limitAmount: '', month, year })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      await client.post('/budgets', {
        categoryId: Number(form.categoryId),
        limitAmount: parseFloat(form.limitAmount),
        month: form.month,
        year: form.year,
      })
      setDialogOpen(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este orçamento?')) return
    await client.delete(`/budgets/${id}`); load()
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Orçamentos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Definir orçamento</Button>
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
                <TableCell>Categoria</TableCell>
                <TableCell>Mês / Ano</TableCell>
                <TableCell align="right">Limite</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Nenhum orçamento para este período
                  </TableCell>
                </TableRow>
              ) : budgets.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.categoryName}</TableCell>
                  <TableCell>{MONTHS[b.month - 1]} {b.year}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{currency(b.limitAmount)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(b.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Definir orçamento</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Categoria" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField
              label="Limite (R$)"
              type="number"
              inputProps={{ min: 0.01, step: 0.01 }}
              value={form.limitAmount}
              onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
            />
            <TextField select label="Mês" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
              {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
            </TextField>
            <TextField select label="Ano" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
              {[2024, 2025, 2026, 2027].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
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
