import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const orders = [
  { id: 1, client: 'Alice', total: '39.99€', statut: 'En attente' },
  { id: 2, client: 'Bob', total: '59.99€', statut: 'Livré' },
];

const OrderTable = () => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#14235E' }}>
          <TableRow>
            <TableCell sx={{ color: '#FFF' }}>Client</TableCell>
            <TableCell sx={{ color: '#FFF' }}>Montant</TableCell>
            <TableCell sx={{ color: '#FFF' }}>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.client}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>{order.statut}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderTable;
