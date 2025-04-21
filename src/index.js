const express = require('express');
const vehicleRoutes = require('./routes/vehicleRoutes'); 
const saleRoutes = require('./routes/saleRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/users', usersRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
