//require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = process.env.EMAIL_FROM || 'bakery@toshankanwar.website';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Toshan Bakery 🍰';

// Helper function to send email via Brevo
async function sendBrevoEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    
    console.log(`✅ Email sent to ${to} | Subject: ${subject}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.response?.data || error.message);
    throw error;
  }
}

// Welcome Email Endpoint
app.post('/send-welcome-email', async (req, res) => {
  const { to, displayName } = req.body;
  
  if (!to || !displayName) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px #eaeaea;">
      <div style="background:#FFB347;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;">🍰 Welcome to Toshan Bakery!</h1>
      </div>
      <div style="background:#fff;padding:32px;">
        <p style="font-size:1.1rem;color:#333;">Hi <strong>${displayName}</strong>,</p>
        <p>We're thrilled to welcome you to <strong>Toshan Bakery</strong> – the most famous local bakery in Raipur!</p>
        <p>
          <a href="https://bakery.toshankanwar.website/shop" 
             style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            Visit Our Shop &rarr;
          </a>
        </p>
        <p>Start shopping and purchasing your favorite items today, or contact us for more details and big orders:</p>
        <ul style="color:#444;font-size:1rem;">
          <li>
            Browse our shop: 
            <a href="https://bakery.toshankanwar.website/shop" style="color:#4CAF50;">bakery.toshankanwar.website/shop</a>
          </li>
          <li>
            Email us: 
            <a href="mailto:contact@toshankanwar.website" style="color:#4CAF50;">contact@toshankanwar.website</a>
          </li>
        </ul>
        <p style="margin-top:32px;color:#555;">Happy shopping,<br/>🍰 Toshan Bakery Team</p>
      </div>
      <div style="background:#f7f7f7;padding:12px;text-align:center;font-size:0.9rem;color:#aaa;">
        &copy; 2025 Toshan Bakery | Raipur's Most Famous Local Bakery
      </div>
    </div>
  `;

  try {
    await sendBrevoEmail(to, `Welcome to Toshan Bakery, ${displayName}!`, htmlContent);
    res.json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Order Confirmation Email Endpoint
app.post('/send-order-confirmation', async (req, res) => {
  const { to, name, order } = req.body;
  
  if (!to || !name || !order) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const deliveryDate = order.deliveryDate;
  const itemsTable = order.items.map(item =>
    `<tr>
      <td style="padding:6px 8px;border:1px solid #eee;">${item.name}</td>
      <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${item.quantity}</td>
      <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">₹${item.price}</td>
      <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px #eaeaea;background:#fff;">
      <div style="background:#4CAF50;padding:24px 0;text-align:center;color:#fff;">
        <h1 style="margin:0;">Toshan Bakery 🍰</h1>
        <h2 style="margin:0;margin-top:8px;">Order Confirmed!</h2>
      </div>
      <div style="padding:32px;">
        <p style="font-size:1.1rem;color:#333;">Hi <strong>${name}</strong>,</p>
        <p>Thank you for your order! Your order has been <span style="color:green;font-weight:bold">confirmed</span>.</p>
        <p>
          <b>Order Date:</b> ${orderDate}<br>
          <b>Delivery Date:</b> ${deliveryDate}
        </p>
        <h3 style="margin:24px 0 8px;">Invoice</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:0.98rem;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Item</th>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Qty</th>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Price</th>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:6px 8px;border:1px solid #eee;text-align:right;"><b>Subtotal</b></td>
              <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">₹${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:6px 8px;border:1px solid #eee;text-align:right;"><b>Shipping</b></td>
              <td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${order.shipping === 0 ? '<span style="color:green;">Free</span>' : `₹${order.shipping.toFixed(2)}`}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:6px 8px;border:1px solid #eee;text-align:right;"><b>Grand Total</b></td>
              <td style="padding:6px 8px;border:1px solid #eee;text-align:right;"><b>₹${order.total.toFixed(2)}</b></td>
            </tr>
          </tfoot>
        </table>
        <h4 style="margin:24px 0 8px;">Delivery Address</h4>
        <p style="font-size:0.97rem;color:#555;">
          ${order.address.name},<br>
          ${order.address.address}${order.address.apartment ? (', ' + order.address.apartment) : ''}<br>
          ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>
          Mobile: ${order.address.mobile}
        </p>
        <p style="margin-top:24px;">
          You can check your order status from your 
          <a href="https://bakery.toshankanwar.website/orders" style="color:#4CAF50;text-decoration:underline;">Order History</a>.
        </p>
        <p style="margin-top:32px;color:#555;">Thank you for choosing Toshan Bakery!<br/>— Toshan Bakery Team</p>
      </div>
      <div style="background:#f7f7f7;padding:12px;text-align:center;font-size:0.9rem;color:#aaa;">
        &copy; 2025 Toshan Bakery | Raipur's Most Famous Local Bakery
      </div>
    </div>
  `;

  try {
    await sendBrevoEmail(to, 'Order Confirmed - Toshan Bakery', htmlContent);
    res.json({ success: true, message: 'Order confirmation email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send order confirmation email', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Toshan Bakery Email Service',
    brevoConfigured: !!BREVO_API_KEY,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Ping endpoint (for keep-alive)
app.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Test email endpoint (for testing)
app.post('/test-email', async (req, res) => {
  const { to } = req.body;
  
  if (!to) {
    return res.status(400).json({ error: 'Email address required' });
  }

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;">
      <h1>Test Email from Toshan Bakery 🍰</h1>
      <p>This is a test email to verify Brevo integration is working.</p>
      <p>If you received this, the email service is configured correctly!</p>
    </div>
  `;

  try {
    await sendBrevoEmail(to, 'Test Email - Toshan Bakery', htmlContent);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

// ============================================
// Self-Ping Service (Keep Render Alive)
// ============================================

let pingInterval = null;

/**
 * Self-ping function to prevent Render free tier from sleeping
 */
function startSelfPing() {
  // Only run in production (on Render)
  if (process.env.NODE_ENV !== 'production') {
    console.log('⏭️  Self-ping disabled (development mode)');
    return;
  }

  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  const SERVER_URL = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

  if (!SERVER_URL) {
    console.warn('⚠️  SERVER_URL not set. Self-ping disabled.');
    console.warn('   Add SERVER_URL to environment variables on Render');
    return;
  }

  console.log('🔔 Starting self-ping service...');
  console.log(`📍 Target URL: ${SERVER_URL}/ping`);
  console.log(`⏱️  Interval: Every 14 minutes`);

  // Initial ping after 1 minute
  setTimeout(() => {
    performPing(SERVER_URL);
  }, 60000);

  // Regular pings every 14 minutes
  pingInterval = setInterval(async () => {
    performPing(SERVER_URL);
  }, PING_INTERVAL);

  console.log('✅ Self-ping service started');
}

/**
 * Perform ping request
 */
async function performPing(serverUrl) {
  try {
    const response = await axios.get(`${serverUrl}/ping`, {
      timeout: 10000 // 10 second timeout
    });
    
    console.log(`🏓 Self-ping successful at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`   Uptime: ${Math.floor(response.data.uptime / 60)} minutes`);
  } catch (error) {
    console.error('❌ Self-ping failed:', error.message);
  }
}

/**
 * Stop self-ping service
 */
function stopSelfPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('🛑 Self-ping service stopped');
  }
}

// ============================================
// Server Initialization
// ============================================

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🍰 Toshan Bakery Mail Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📧 Email From: ${FROM_EMAIL}`);
  console.log(`🔑 Brevo API: ${BREVO_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Start self-ping service
  startSelfPing();
});

// ============================================
// Graceful Shutdown Handlers
// ============================================

/**
 * SIGTERM handler (graceful shutdown)
 */
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received');
  console.log('📦 Closing server...');
  
  stopSelfPing();
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

/**
 * SIGINT handler (Ctrl+C)
 */
process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received (Ctrl+C)');
  console.log('📦 Closing server...');
  
  stopSelfPing();
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  
  stopSelfPing();
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  
  stopSelfPing();
  process.exit(1);
});
