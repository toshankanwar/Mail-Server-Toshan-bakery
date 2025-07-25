const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: "contact@toshankanwar.website",
    pass: "hR5uCDzEee1p",
  },
});

// Welcome Email Endpoint (unchanged)
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
    await transporter.sendMail({
      from: '"Toshan Bakery 🍰" <contact@toshankanwar.website>',
      to,
      subject: `Welcome to Toshan Bakery, ${displayName}!`,
      html: htmlContent
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Email send failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
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
    await transporter.sendMail({
      from: '"Toshan Bakery 🍰" <contact@toshankanwar.website>',
      to,
      subject: `Order Confirmed - Toshan Bakery`,
      html: htmlContent
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Order email send failed:', error);
    res.status(500).json({ error: 'Failed to send order confirmation email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mail server running on port ${PORT}`);
});