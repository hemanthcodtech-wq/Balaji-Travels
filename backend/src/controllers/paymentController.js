import { sql } from '../config/db.js';
import { generateInitiateHash, verifyResponseHash } from '../utils/easebuzz.js';
import { sendPaymentConfirmationEmails } from '../utils/emailService.js';

const EASEBUZZ_KEY = process.env.EASEBUZZ_KEY || 'PO2QJZOI4';
const EASEBUZZ_SALT = process.env.EASEBUZZ_SALT || 'Y2R6AQMIE';
const EASEBUZZ_ENV = process.env.EASEBUZZ_ENV || 'test';
const BACKEND_URL = process.env.BACKEND_URL || 'https://balaji-travels-7mpf.vercel.app';
const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || 'https://balaji-travels-six.vercel.app';

// Helper to determine accurate frontend return URL
const getTargetFrontendUrl = (req, fallbackUrl) => {
  // 1. If explicit query parameter or stored in booking
  if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.startsWith('http')) {
    return fallbackUrl.replace(/\/+$/, '');
  }
  // 2. If client provided origin in headers (e.g. from axios/fetch)
  const reqOrigin = req.headers?.origin || req.headers?.referer;
  if (reqOrigin) {
    try {
      const parsed = new URL(reqOrigin);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {}
  }
  // 3. Environment or Production domain
  return DEFAULT_FRONTEND_URL.replace(/\/+$/, '');
};

const EASEBUZZ_INITIATE_URL = EASEBUZZ_ENV === 'prod'
  ? 'https://pay.easebuzz.in/payment/initiateLink'
  : 'https://testpay.easebuzz.in/payment/initiateLink';

/**
 * Initiates payment with Easebuzz API
 */
export const initiatePayment = async (req, res) => {
  try {
    const {
      firstname,
      email,
      phone,
      amount,
      productinfo,
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = '',
    } = req.body;

    if (!firstname || !phone || !amount || !productinfo) {
      return res.status(400).json({
        success: false,
        message: 'firstname, phone, amount, and productinfo are required.',
      });
    }

    // Sanitize phone number (remove spaces, symbols, leading +91 or 0)
    const cleanPhone = phone.toString().replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit phone number is required.',
      });
    }

    // Format amount to 2 decimal places e.g., "1000.00"
    const formattedAmount = parseFloat(amount).toFixed(2);
    const txnid = `TBT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Clean customer name and productinfo for Easebuzz
    const cleanFirstName = firstname.trim().replace(/[^a-zA-Z0-9\s]/g, '') || 'Devotee';
    const cleanProductInfo = productinfo.trim().replace(/[^a-zA-Z0-9\s_-]/g, '').slice(0, 95) || 'Cab Booking';

    // Determine origin return URL and pass via udf5 so callback knows where to redirect
    const returnUrl = req.body.return_url || req.headers?.origin || DEFAULT_FRONTEND_URL;
    const resolvedUdf5 = (udf5 || returnUrl).toString().slice(0, 100);

    // Generate SHA-512 Hash
    const hash = generateInitiateHash({
      key: EASEBUZZ_KEY,
      txnid,
      amount: formattedAmount,
      productinfo: cleanProductInfo,
      firstname: cleanFirstName,
      email: email || 'guest@example.com',
      udf1,
      udf2,
      udf3,
      udf4,
      udf5: resolvedUdf5,
      salt: EASEBUZZ_SALT,
    });

    const surl = `${BACKEND_URL}/api/payments/callback`;
    const furl = `${BACKEND_URL}/api/payments/callback`;

    // Persist initiated payment in Neon DB
    if (sql) {
      await sql`
        INSERT INTO payments (
          txnid,
          amount,
          firstname,
          email,
          phone,
          productinfo,
          status
        ) VALUES (
          ${txnid},
          ${formattedAmount},
          ${cleanFirstName},
          ${email || null},
          ${cleanPhone},
          ${cleanProductInfo},
          'initiated'
        )
        ON CONFLICT (txnid) DO NOTHING;
      `;
    }

    // Prepare URL-encoded form data for Easebuzz
    const params = new URLSearchParams();
    params.append('key', EASEBUZZ_KEY);
    params.append('txnid', txnid);
    params.append('amount', formattedAmount);
    params.append('productinfo', cleanProductInfo);
    params.append('firstname', cleanFirstName);
    params.append('phone', cleanPhone);
    params.append('email', email || 'guest@example.com');
    params.append('surl', surl);
    params.append('furl', furl);
    params.append('hash', hash);
    params.append('udf1', udf1);
    params.append('udf2', udf2);
    params.append('udf3', udf3);
    params.append('udf4', udf4);
    params.append('udf5', udf5);

    // Call Easebuzz initiateLink API
    const response = await fetch(EASEBUZZ_INITIATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    const easebuzzData = await response.json();

    if (easebuzzData.status === 1) {
      return res.status(200).json({
        success: true,
        access_key: easebuzzData.data,
        txnid,
        key: EASEBUZZ_KEY,
        environment: EASEBUZZ_ENV,
        payment_url: EASEBUZZ_ENV === 'prod'
          ? `https://pay.easebuzz.in/pay/${easebuzzData.data}`
          : `https://testpay.easebuzz.in/pay/${easebuzzData.data}`,
      });
    } else {
      console.error('Easebuzz initiateLink returned error:', easebuzzData);
      return res.status(400).json({
        success: false,
        message: easebuzzData.error_desc || easebuzzData.data || 'Failed to initiate payment with Easebuzz.',
      });
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ success: false, message: 'Server error initiating payment.' });
  }
};

/**
 * Easebuzz POST Webhook / Callback handler
 */
export const handleEasebuzzCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('Easebuzz Callback received:', callbackData);

    const isValid = verifyResponseHash(callbackData, EASEBUZZ_SALT, EASEBUZZ_KEY);
    const {
      txnid,
      easepayid,
      status,
      mode,
      error_Message,
      amount,
    } = callbackData;

    const paymentStatus = (isValid && status?.toLowerCase() === 'success') ? 'SUCCESS' : 'FAILED';

    if (sql && txnid) {
      await sql`
        UPDATE payments
        SET 
          easebuzz_id = ${easepayid || null},
          status = ${paymentStatus},
          payment_mode = ${mode || null},
          error_message = ${error_Message || null},
          raw_response = ${JSON.stringify(callbackData)},
          updated_at = CURRENT_TIMESTAMP
        WHERE txnid = ${txnid};
      `;

      // Update related booking if txnid matches
      await sql`
        UPDATE bookings
        SET 
          payment_status = ${paymentStatus.toLowerCase()},
          payment_txnid = ${txnid}
        WHERE payment_txnid = ${txnid};
      `;

      // Trigger automatic invoice email to customer and admin
      if (paymentStatus === 'SUCCESS') {
        const paymentRecords = await sql`
          SELECT * FROM payments WHERE txnid = ${txnid} LIMIT 1;
        `;
        const record = paymentRecords?.[0] || {};

        sendPaymentConfirmationEmails({
          txnid,
          easepayid: easepayid || record.easebuzz_id,
          amount: amount || record.amount,
          firstname: record.firstname || callbackData.firstname || 'Customer',
          email: record.email || callbackData.email,
          phone: record.phone || callbackData.phone,
          productinfo: record.productinfo || callbackData.productinfo || 'Cab & Tour Booking',
          mode: mode || record.payment_mode || 'Online Gateway',
          date: record.updated_at || new Date(),
        }).catch(err => console.error('Background email dispatch error:', err));
      }
    }

    // Determine accurate frontend redirect URL (e.g. https://balaji-travels-six.vercel.app)
    const frontendTarget = getTargetFrontendUrl(req, callbackData.udf5 || req.query?.return_url);

    // Redirect user back to frontend confirmation page with query params
    const redirectUrl = `${frontendTarget}/payment-status?status=${paymentStatus}&txnid=${txnid}&easebuzz_id=${easepayid || ''}&amount=${amount || ''}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling Easebuzz callback:', error);
    const frontendTarget = getTargetFrontendUrl(req);
    return res.redirect(`${frontendTarget}/payment-status?status=FAILED&message=VerificationError`);
  }
};

/**
 * Fetch all payments history for Admin
 */
export const getAllPayments = async (req, res) => {
  try {
    if (!sql) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const payments = await sql`
      SELECT * FROM payments ORDER BY created_at DESC;
    `;

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving payments.' });
  }
};
