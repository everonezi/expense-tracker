import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, CircularProgress, Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import client from '../api/client'

const EMPTY_FORM = { name: '', icon: '', type: 'EXPENSE' }

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    client.get('/categories').then((res) => setCategories(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null); setForm(EMPTY_FORM); setError(''); setDialogOpen(true)
  }

  function openEdit(c) {
    setEditId(c.id); setForm({ name: c.name, icon: c.icon || '', type: c.type }); setError(''); setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      editId ? await client.put(`/categories/${editId}`, form) : await client.post('/categories', form)
      setDialogOpen(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esta categoria?')) return
    try {
      await client.delete(`/categories/${id}`); load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover')
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Categorias</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova categoria</Button>
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
                <TableCell>Origem</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.type === 'EXPENSE' ? 'Despesa' : 'Receita'}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.systemDefault ? 'Padrão' : 'Customizada'}
                      size="small"
                      color={c.systemDefault ? 'default' : 'primary'}
                      variant={c.systemDefault ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {!c.systemDefault && (
                      <>
                        <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editId ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField
              label="Ícone (ex: restaurant)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              helperText="Nome de ícone do Material Icons"
            />
            <TextField select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="EXPENSE">Despesa</MenuItem>
              <MenuItem value="INCOME">Receita</MenuItem>
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
