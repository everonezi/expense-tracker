import { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  Chip, List, ListItem, ListItemText, Divider, CircularProgress,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import client from '../api/client'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h5" fontWeight="bold" color={color}>{currency(value)}</Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8, mt: 0.5 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function budgetColor(status) {
  if (status === 'EXCEEDED') return 'error'
  if (status === 'WARNING') return 'warning'
  return 'success'
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()

  useEffect(() => {
    client.get(`/dashboard?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
  }
  if (!data) return null

  const { summary, budgets, recentTransactions } = data

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Dashboard — {MONTHS[summary.month - 1]} {summary.year}
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Receitas" value={summary.totalIncome} icon={<TrendingUpIcon />} color="success.main" />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard title="Despesas" value={summary.totalExpenses} icon={<TrendingDownIcon />} color="error.main" />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Saldo"
            value={summary.balance}
            icon={<AccountBalanceIcon />}
            color={summary.balance >= 0 ? 'success.main' : 'error.main'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Orçamentos do mês</Typography>
              {budgets.length === 0 ? (
                <Typography color="text.secondary">
                  Nenhum orçamento configurado. Acesse "Orçamentos" para definir limites.
                </Typography>
              ) : (
                budgets.map((b) => (
                  <Box key={b.budgetId} mb={2.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">{b.categoryName}</Typography>
                      <Chip label={`${b.percentageUsed}%`} color={budgetColor(b.status)} size="small" />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(b.percentageUsed, 100)}
                      color={budgetColor(b.status)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">{currency(b.spent)} gastos</Typography>
                      <Typography variant="caption" color="text.secondary">limite {currency(b.limit)}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Últimas transações</Typography>
              {recentTransactions.length === 0 ? (
                <Typography color="text.secondary">Nenhuma transação registrada.</Typography>
              ) : (
                <List disablePadding>
                  {recentTransactions.map((t, i) => (
                    <Box key={t.id}>
                      {i > 0 && <Divider />}
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary={t.description || t.categoryName}
                          secondary={`${t.accountName} · ${new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                          primaryTypographyProps={{ noWrap: true }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={t.type === 'INCOME' ? 'success.main' : 'error.main'}
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                        >
                          {t.type === 'INCOME' ? '+' : '-'}{currency(t.amount)}
                        </Typography>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
