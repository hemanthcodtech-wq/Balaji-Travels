import crypto from 'crypto';

/**
 * Easebuzz Hash Formula for Payment Initiation:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
export const generateInitiateHash = ({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
  salt,
}) => {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
};

/**
 * Easebuzz Response Reverse Hash Verification Formula:
 * sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export const verifyResponseHash = (params, salt, key) => {
  const {
    status = '',
    udf10 = '',
    udf9 = '',
    udf8 = '',
    udf7 = '',
    udf6 = '',
    udf5 = '',
    udf4 = '',
    udf3 = '',
    udf2 = '',
    udf1 = '',
    email = '',
    firstname = '',
    productinfo = '',
    amount = '',
    txnid = '',
    hash = '',
  } = params;

  const hashString = `${salt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  return calculatedHash.toLowerCase() === (hash || '').toLowerCase();
};
