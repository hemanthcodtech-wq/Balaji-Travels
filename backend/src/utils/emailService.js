import nodemailer from 'nodemailer';

/**
 * Creates and returns configured nodemailer transporter using Gmail App Password
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
};

/**
 * Generates modern, branded HTML invoice receipt template
 */
export const generateInvoiceHtml = ({
  txnid,
  easepayid,
  amount,
  firstname,
  email,
  phone,
  productinfo,
  date,
  mode,
  isAdmin = false,
}) => {
  const formattedDate = date ? new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) : new Date().toLocaleString('en-IN');

  const formattedAmount = Number(amount || 0).toLocaleString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Receipt - Tirupati Balaji Tours & Travels</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.07); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .badge { display: inline-block; background: #10b981; color: #ffffff; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-top: 10px; letter-spacing: 0.5px; }
        .content { padding: 28px 24px; }
        .invoice-card { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 24px; text-align: center; }
        .invoice-card .amount-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .invoice-card .amount-val { font-size: 32px; font-weight: 800; color: #0f172a; margin: 4px 0; }
        .invoice-card .amount-sub { font-size: 12px; color: #0284c7; font-weight: 600; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table td { padding: 10px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .table td.label { color: #64748b; font-weight: 600; width: 40%; }
        .table td.value { color: #0f172a; font-weight: 700; text-align: right; width: 60%; word-break: break-word; }
        .inclusions { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #166534; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; }
        .footer a { color: #0284c7; text-decoration: none; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Tirupati Balaji Tours & Travels</h1>
          <p>${isAdmin ? '🔔 New Customer Payment Notification' : '🙏 Sacred Darshan & Cab Booking Confirmed'}</p>
          <span class="badge">Payment Successful</span>
        </div>

        <div class="content">
          <p style="font-size: 14px; margin-top: 0;">
            ${isAdmin 
              ? `Hello Admin, a customer has successfully paid an online advance deposit via Easebuzz:` 
              : `Dear <strong>${firstname || 'Devotee'}</strong>, thank you for booking with us! Your advance payment has been successfully received.`
            }
          </p>

          <div class="invoice-card">
            <div class="amount-label">ADVANCE DEPOSIT RECEIVED</div>
            <div class="amount-val">₹${formattedAmount}</div>
            <div class="amount-sub">Remaining balance payable directly to driver at trip conclusion</div>
          </div>

          <table class="table">
            <tr>
              <td class="label">Transaction ID</td>
              <td class="value" style="font-family: monospace; color: #0284c7;">${txnid}</td>
            </tr>
            <tr>
              <td class="label">Easebuzz Ref ID</td>
              <td class="value" style="font-family: monospace;">${easepayid || 'EZB_VERIFIED'}</td>
            </tr>
            <tr>
              <td class="label">Customer Name</td>
              <td class="value">${firstname}</td>
            </tr>
            <tr>
              <td class="label">Mobile Number</td>
              <td class="value">${phone}</td>
            </tr>
            ${email ? `
            <tr>
              <td class="label">Email Address</td>
              <td class="value">${email}</td>
            </tr>` : ''}
            <tr>
              <td class="label">Booked Service</td>
              <td class="value">${productinfo}</td>
            </tr>
            <tr>
              <td class="label">Payment Mode</td>
              <td class="value">${mode || 'UPI / Online Gateway'}</td>
            </tr>
            <tr>
              <td class="label">Date & Time</td>
              <td class="value">${formattedDate}</td>
            </tr>
          </table>

          <div class="inclusions">
            <strong>✅ Cab Inclusions:</strong> Clean AC Vehicle, Professional Ghat-Road Experienced Chauffeur, Fuel & 24/7 Helpline Support.
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Driver contact and vehicle registration details will be shared via WhatsApp / SMS 2 hours prior to your scheduled pickup.
          </p>
        </div>

        <div class="footer">
          <strong>Tirupati Balaji Tours & Travels</strong><br />
          Near Tirupati Railway Station / RTC Bus Stand, Tirupati, AP<br />
          Helpline: <a href="tel:+918688624758">+91 86886 24758</a> | WhatsApp: <a href="https://wa.me/918688624758">+91 86886 24758</a><br />
          <a href="https://balaji-travels-six.vercel.app">Visit Website</a>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Dispatches confirmation emails to customer and admin
 */
export const sendPaymentConfirmationEmails = async ({
  txnid,
  easepayid,
  amount,
  firstname,
  email,
  phone,
  productinfo,
  mode,
  date,
}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('✉️ Email notification skipped: EMAIL_USER or EMAIL_APP_PASSWORD not set in environment.');
    return { success: false, reason: 'EMAIL_CONFIG_MISSING' };
  }

  const senderEmail = process.env.EMAIL_USER;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;

  const results = [];

  // 1. Send Customer Confirmation Email (if customer provided email)
  if (email && email.includes('@') && !email.includes('example.com')) {
    try {
      const customerHtml = generateInvoiceHtml({
        txnid,
        easepayid,
        amount,
        firstname,
        email,
        phone,
        productinfo,
        date,
        mode,
        isAdmin: false,
      });

      const customerMailOptions = {
        from: `"Tirupati Balaji Tours & Travels" <${senderEmail}>`,
        to: email.trim(),
        subject: `Booking Confirmed: Payment Receipt for ${productinfo.slice(0, 45)} (₹${amount})`,
        html: customerHtml,
      };

      const info = await transporter.sendMail(customerMailOptions);
      console.log(`✉️ Customer invoice email sent to ${email}:`, info.messageId);
      results.push({ to: email, status: 'sent', messageId: info.messageId });
    } catch (err) {
      console.error(`Failed to send customer email to ${email}:`, err);
      results.push({ to: email, status: 'failed', error: err.message });
    }
  }

  // 2. Send Admin Alert Email
  if (adminEmail && adminEmail.includes('@')) {
    try {
      const adminHtml = generateInvoiceHtml({
        txnid,
        easepayid,
        amount,
        firstname,
        email,
        phone,
        productinfo,
        date,
        mode,
        isAdmin: true,
      });

      const adminMailOptions = {
        from: `"TTD Travels Alert" <${senderEmail}>`,
        to: adminEmail.trim(),
        subject: `🔔 New Online Payment: ₹${amount} received from ${firstname} (${phone})`,
        html: adminHtml,
      };

      const info = await transporter.sendMail(adminMailOptions);
      console.log(`✉️ Admin notification email sent to ${adminEmail}:`, info.messageId);
      results.push({ to: adminEmail, status: 'sent', messageId: info.messageId });
    } catch (err) {
      console.error(`Failed to send admin email to ${adminEmail}:`, err);
      results.push({ to: adminEmail, status: 'failed', error: err.message });
    }
  }

  return { success: true, results };
};
