require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Credenciales de Siigo
const siigoUsuario = process.env.SIIGO_USUARIO;
const siigoAccessKey = process.env.SIIGO_ACCESS_KEY;
const siigoPartnerId = process.env.SIIGO_PARTNER_ID;

if (!siigoUsuario || !siigoAccessKey || !siigoPartnerId) {
  throw new Error('Faltan variables de entorno de Siigo (SIIGO_USUARIO, SIIGO_ACCESS_KEY, SIIGO_PARTNER_ID). Revisa tu archivo .env');
}

// Obtener token
async function obtenerToken() {
  try {
    const response = await axios.post(
      'https://api.siigo.com/auth',
      {
        username: siigoUsuario,
        access_key: siigoAccessKey
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Partner-Id': siigoPartnerId
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error al autenticar:', error.response?.data || error.message);
    throw error;
  }
}

// Función de paginación para todos los endpoints
async function consultarPaginasCompletas(endpoint) {
  const token = await obtenerToken();
  const pageSize = 100;
  let page = 1;
  let results = [];
  let totalPages = 1;

  do {
    const url = new URL(endpoint);
    url.searchParams.set('page', page);
    url.searchParams.set('page_size', pageSize);

    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Partner-Id': siigoPartnerId
      }
    });

    const pageData = response.data.results || [];
    results = results.concat(pageData);
    const totalResults = response.data.pagination?.total_results || pageData.length;
    totalPages = Math.ceil(totalResults / pageSize);
    page++;
  } while (page <= totalPages);

  return results;
}

// Endpoints que traen todos los resultados

app.get('/productos', async (req, res) => {
  try {
    const data = await consultarPaginasCompletas('https://api.siigo.com/v1/products');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/clientes', async (req, res) => {
  try {
    const data = await consultarPaginasCompletas('https://api.siigo.com/v1/customers');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.get('/facturas', async (req, res) => {
  try {
    const data = await consultarPaginasCompletas('https://api.siigo.com/v1/invoices');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

app.get('/compras', async (req, res) => {
  try {
    const data = await consultarPaginasCompletas('https://api.siigo.com/v1/purchases');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener compras' });
  }
});

app.get('/notas-credito', async (req, res) => {
  try {
    const data = await consultarPaginasCompletas('https://api.siigo.com/v1/credit-notes');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notas de crédito' });
  }
});

app.get('/recibos-caja', async (req, res) => {
  try {
    const data = await consultarPaginasCompletas('https://api.siigo.com/v1/vouchers');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener recibos de caja' });
  }
});

app.get('/comprobantes', async (req, res) => {
  const { start, end } = req.query;
  const startDate = start || '2000-01-01';
  const endDate = end || new Date().toISOString().split('T')[0];

  try {
    const token = await obtenerToken();
    const pageSize = 100;
    let page = 1;
    let results = [];
    let totalPages = 1;

    do {
      const url = new URL('https://api.siigo.com/v1/journals');
      url.searchParams.set('start_date', startDate);
      url.searchParams.set('end_date', endDate);
      url.searchParams.set('page', page);
      url.searchParams.set('page_size', pageSize);

      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Partner-Id': siigoPartnerId
        }
      });

      const pageData = response.data.results || [];
      results = results.concat(pageData);
      const totalResults = response.data.pagination?.total_results || pageData.length;
      totalPages = Math.ceil(totalResults / pageSize);
      page++;
    } while (page <= totalPages);

    res.json(results);
  } catch (err) {
    console.error('❌ Error al obtener comprobantes:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Error al obtener comprobantes contables',
      detail: err.response?.data || err.message
    });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Microservicio activo en http://localhost:${port}`);
});
