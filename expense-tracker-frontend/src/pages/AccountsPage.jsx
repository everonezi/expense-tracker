import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import client from '../api/client'

const ACCOUNT_TYPES = { CREDIT: 'Cartão de crédito', DEBIT: 'Débito', CASH: 'Dinheiro', PIX: 'Pix' }
const EMPTY_FORM = { name: '', type: 'DEBIT' }

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    client.get('/accounts').then((res) => setAccounts(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null); setForm(EMPTY_FORM); setError(''); setDialogOpen(true)
  }

  function openEdit(a) {
    setEditId(a.id); setForm({ name: a.name, type: a.type }); setError(''); setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      editId ? await client.put(`/accounts/${editId}`, form) : await client.post('/accounts', form)
      setDialogOpen(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esta conta?')) return
    try {
      await client.delete(`/accounts/${id}`); load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover')
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Contas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova conta</Button>
      </Box>

      <Card>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Nenhuma conta cadastrada
                  </TableCell>
                </TableRow>
              ) : accounts.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{ACCOUNT_TYPES[a.type]}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(a)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editId ? 'Editar conta' : 'Nova conta'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(ACCOUNT_TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
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
