# Toshan Bakery Mail Server

This is an Express-based Node.js mail server for Toshan Bakery.  
It handles sending automated emails such as welcome emails when users sign up, and order confirmation emails with invoice details after an order is placed.

## Features

- **Welcome Email**: Sends a custom HTML welcome email to new users.
- **Order Confirmation Email**: Sends a detailed HTML order confirmation including an invoice and delivery details.
- **CORS Enabled**: Allows requests from your frontend.
- **Secure SMTP**: Uses Zoho SMTP for reliable and branded email delivery.

## Endpoints

### `POST /send-welcome-email`

Send a welcome email to a new user.

**Request JSON:**
```json
{
  "to": "user@example.com",
  "displayName": "User Name"
}
```

**Response:**
- `200 OK` `{ "success": true }`
- `400 Bad Request` if required fields are missing.
- `500 Internal Server Error` if mail send fails.

---

### `POST /send-order-confirmation`

Send an order confirmation email with invoice.

**Request JSON:**
```json
{
  "to": "user@example.com",
  "name": "User Name",
  "order": {
    "createdAt": "2025-07-25T17:30:00.000Z",
    "deliveryDate": "2025-07-27",
    "subtotal": 300,
    "shipping": 0,
    "total": 300,
    "items": [
      { "name": "Chocolate Cake", "quantity": 1, "price": 200 },
      { "name": "Bread", "quantity": 2, "price": 50 }
    ],
    "address": {
      "name": "User Name",
      "address": "123 Main Street",
      "apartment": "Apt 4A",
      "city": "Raipur",
      "state": "Chhattisgarh",
      "pincode": "492001",
      "mobile": "9876543210"
    }
  }
}
```

**Response:**
- `200 OK` `{ "success": true }`
- `400 Bad Request` if required fields are missing.
- `500 Internal Server Error` if mail send fails.

---

## Setup & Usage

### 1. Clone the repository

```sh
git clone https://github.com/your-org/toshan-bakery-mail-server.git
cd toshan-bakery-mail-server
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure SMTP

Edit `server.js` and update the SMTP config:
```js
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: "contact@toshankanwar.website",
    pass: "YOUR_EMAIL_PASSWORD"
  }
});
```

### 4. Start the server

```sh
node server.js
```

The server will run on port `3001` (or set `PORT` in your environment).

---

## Deployment

- Deploy on any Node.js-compatible server (VPS, Railway, Render, etc.).
- Ensure port 3001 (or your custom port) is open and accessible to your frontend.
- Use PM2 or a similar process manager for production.

---

## Security Notes

- Never commit your real SMTP password to public repositories.
- Use environment variables to store sensitive credentials.
- Restrict CORS origins to your frontend domain in production.

---

## Example `curl` Requests

#### Welcome Email

```sh
curl -X POST http://localhost:3001/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","displayName":"Test User"}'
```

#### Order Confirmation

```sh
curl -X POST http://localhost:3001/send-order-confirmation \
  -H "Content-Type: application/json" \
  -d @order.json
```
*(where `order.json` contains the example order payload above)*

---

## Contact

- **Email:** [contact@toshankanwar.website](mailto:contact@toshankanwar.website)
- **Portfolio:** [https://toshankanwar.website/](https://toshankanwar.website/)

---

## License

MIT

---