import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Paper, TextField, Button, Typography, Link, Alert } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ familyName: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.familyName, form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Paper sx={{ p: 4, width: 420 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>Criar conta</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Nome da família" required value={form.familyName} onChange={set('familyName')} />
          <TextField label="Seu nome" required value={form.name} onChange={set('name')} />
          <TextField label="E-mail" type="email" required value={form.email} onChange={set('email')} />
          <TextField label="Senha" type="password" required inputProps={{ minLength: 6 }} value={form.password} onChange={set('password')} />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Box>
        <Typography mt={2} textAlign="center" variant="body2">
          Já tem conta?{' '}
          <Link component={RouterLink} to="/login">Entrar</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
