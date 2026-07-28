import { Resend } from 'resend';

let connectionSettings: any;

async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  // Direct API key takes priority (local dev / production)
  if (process.env.RESEND_API_KEY) {
    return {
      client: new Resend(process.env.RESEND_API_KEY),
      fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@virtusgreen.io",
    };
  }

  // Fallback: Replit connector
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken || !hostname) throw new Error('No email credentials configured');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);

  if (!connectionSettings?.settings?.api_key) throw new Error('Resend not connected');
  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email,
  };
}

// Alias kept for existing callers
const getUncachableResendClient = getResendClient;

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  projectType: string;
  message: string;
}) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const { data: emailData, error } = await client.emails.send({
      from: fromEmail,
      to: ['andrea.amenta87@gmail.com'],
      subject: `New Contact Form Submission - ${data.projectType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c6e49;">New Contact Form Submission</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Project Type:</strong> ${data.projectType}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="background-color: #ffffff; padding: 15px; border-left: 4px solid #2c6e49; border-radius: 4px;">
              ${data.message.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            This email was sent from the VirtusGreen contact form.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', emailData);
    return emailData;
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    throw error;
  }
}

export async function sendDppReadyEmail(data: {
  producerName: string;
  producerEmail: string;
  farmName: string;
  batchCode: string;
  skin: string;
  ndviAvg: string;
  txHash?: string;
  dppUrl: string;
}) {
  try {
    const { client, fromEmail } = await getResendClient();
    const skinLabel: Record<string, string> = {
      bronte: "Bronte DOP Pistachio 🌿",
      etna: "Etna DOC Wine 🍷",
      modica: "Modica IGP Chocolate 🍫",
      yubari: "Yubari Melon 🍈",
    };
    const { data: emailData, error } = await client.emails.send({
      from: fromEmail,
      to: [data.producerEmail],
      subject: `✅ Your batch ${data.batchCode} has been verified — Digital Product Passport ready`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #043231; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #c0fa79; margin: 0; font-size: 22px; letter-spacing: -0.5px;">VirtusGreen</h1>
            <p style="color: #ffffff99; margin: 4px 0 0; font-size: 13px;">Green Intelligence for Certified Products</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
            <p style="color: #043231; font-size: 16px; margin-top: 0;">Hi ${data.producerName},</p>
            <p>Your batch <strong>${data.batchCode}</strong> (${skinLabel[data.skin] ?? data.skin}) from <strong>${data.farmName}</strong> has been successfully verified by Copernicus Sentinel-2 satellite imagery and anchored on the Ethereum blockchain.</p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">Verification summary</p>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 4px 0; color: #6b7280;">Batch code</td><td style="font-weight: 600;">${data.batchCode}</td></tr>
                <tr><td style="padding: 4px 0; color: #6b7280;">Product</td><td>${skinLabel[data.skin] ?? data.skin}</td></tr>
                <tr><td style="padding: 4px 0; color: #6b7280;">NDVI average</td><td>${data.ndviAvg}</td></tr>
                ${data.txHash ? `<tr><td style="padding: 4px 0; color: #6b7280;">Blockchain anchor</td><td style="font-family: monospace; font-size: 12px; word-break: break-all;">${data.txHash.slice(0, 20)}…</td></tr>` : ""}
              </table>
            </div>

            <a href="${data.dppUrl}" style="display: inline-block; background: #00af67; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">View Digital Product Passport →</a>

            <p style="margin-top: 28px; font-size: 13px; color: #6b7280;">Share this link with your buyers, certifiers, or on your product packaging. The DPP is publicly accessible at the URL above.</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">VirtusGreen · GI Provenance Verification · <a href="https://virtusgreen.io" style="color: #00af67;">virtusgreen.io</a></p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0;">This is an automated verification notification. The DPP is advisory; final GI certification remains the responsibility of accredited bodies.</p>
          </div>
        </div>
      `,
    });
    if (error) throw error;
    console.log(`DPP email sent to ${data.producerEmail} for batch ${data.batchCode}`);
    return emailData;
  } catch (error) {
    console.error('Failed to send DPP ready email:', error);
    throw error;
  }
}
