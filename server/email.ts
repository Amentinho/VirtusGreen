import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

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
