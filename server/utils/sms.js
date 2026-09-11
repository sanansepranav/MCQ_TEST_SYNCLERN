const axios = require('axios');

/**
 * Send SMS OTP to student mobile number.
 * Supports Fast2SMS (India), Twilio (Global), or simulated dev delivery.
 */
const sendSMSOTP = async (mobileNumber, otpCode) => {
  const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
  const message = `Your SyncTest verification code is ${otpCode}. Valid for 10 minutes.`;

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║ 📱  [SyncTest SMS OTP Dispatch]                  ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║ Mobile:  +91 ${cleanMobile.padEnd(35)}║`);
  console.log(`║ OTP:     ${otpCode.padEnd(39)}║`);
  console.log(`║ Message: ${message.substring(0, 39).padEnd(39)}║`);
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Fast2SMS integration if API key is present
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanMobile,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
          },
        }
      );
      console.log('✅ Fast2SMS API response:', response.data);
      return { success: true, provider: 'fast2sms' };
    } catch (err) {
      console.warn('⚠️ Fast2SMS dispatch error:', err.message);
    }
  }

  // Twilio integration if credentials are present
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${cleanMobile}`,
      });
      console.log('✅ Twilio SMS dispatched successfully');
      return { success: true, provider: 'twilio' };
    } catch (err) {
      console.warn('⚠️ Twilio dispatch error:', err.message);
    }
  }

  return { success: true, provider: 'simulated' };
};

module.exports = { sendSMSOTP };
