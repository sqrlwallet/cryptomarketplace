import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TransactionEmailPayload {
  type: 'buyer' | 'seller';
  recipientEmail: string;
  recipientName: string;
  productTitle: string;
  productPrice: number;
  currency: string;
  transactionId: string;
  buyerName?: string;
  sellerName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: TransactionEmailPayload = await req.json();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    let subject = '';
    let htmlContent = '';

    if (payload.type === 'buyer') {
      subject = `Purchase Confirmed: ${payload.productTitle}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; background-color: #000; color: #fff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; border: 2px solid #39FF14; padding: 30px; background-color: #000; }
            .header { border-bottom: 2px solid #39FF14; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #39FF14; }
            .content { line-height: 1.6; }
            .detail { margin: 15px 0; padding: 10px; border-left: 3px solid #39FF14; }
            .label { color: #888; text-transform: uppercase; font-size: 12px; }
            .value { color: #fff; font-size: 16px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #39FF14; color: #888; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #39FF14; color: #000; text-decoration: none; font-weight: bold; text-transform: uppercase; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">Purchase Confirmed</div>
              <p style="color: #888; margin-top: 5px;">&gt;&gt; TRANSACTION_COMPLETE</p>
            </div>
            
            <div class="content">
              <p>Hello ${payload.recipientName},</p>
              <p>Your purchase has been successfully completed! You now have access to your product.</p>
              
              <div class="detail">
                <div class="label">Product</div>
                <div class="value">${payload.productTitle}</div>
              </div>
              
              <div class="detail">
                <div class="label">Amount Paid</div>
                <div class="value">${payload.productPrice} ${payload.currency}</div>
              </div>
              
              <div class="detail">
                <div class="label">Transaction ID</div>
                <div class="value">${payload.transactionId}</div>
              </div>
              
              <p style="margin-top: 30px;">You can access your purchased product and download any files from your "My Purchases" page.</p>
              
              <a href="${Deno.env.get('SITE_URL') || 'https://ripework.xyz'}" class="button">View My Purchases</a>
            </div>
            
            <div class="footer">
              <p>&gt;&gt; BLOCKCHAIN_VERIFIED_TRANSACTION</p>
              <p>This is an automated message from Ripework. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `Sale Confirmed: ${payload.productTitle}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; background-color: #000; color: #fff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; border: 2px solid #39FF14; padding: 30px; background-color: #000; }
            .header { border-bottom: 2px solid #39FF14; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #39FF14; }
            .content { line-height: 1.6; }
            .detail { margin: 15px 0; padding: 10px; border-left: 3px solid #39FF14; }
            .label { color: #888; text-transform: uppercase; font-size: 12px; }
            .value { color: #fff; font-size: 16px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #39FF14; color: #888; font-size: 12px; }
            .highlight { color: #39FF14; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">Sale Confirmed</div>
              <p style="color: #888; margin-top: 5px;">&gt;&gt; PAYMENT_RECEIVED</p>
            </div>
            
            <div class="content">
              <p>Hello ${payload.recipientName},</p>
              <p>Congratulations! You've made a sale on Ripework.</p>
              
              <div class="detail">
                <div class="label">Product Sold</div>
                <div class="value">${payload.productTitle}</div>
              </div>
              
              <div class="detail">
                <div class="label">Sale Amount (90% after fees)</div>
                <div class="value">${(payload.productPrice * 0.9).toFixed(4)} ${payload.currency}</div>
              </div>
              
              <div class="detail">
                <div class="label">Buyer</div>
                <div class="value">${payload.buyerName || 'Anonymous'}</div>
              </div>
              
              <div class="detail">
                <div class="label">Transaction ID</div>
                <div class="value">${payload.transactionId}</div>
              </div>
              
              <p style="margin-top: 30px;">The payment has been transferred to your wallet. You can view all your transactions in the Seller Dashboard.</p>
              
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                <span class="highlight">Note:</span> A 10% platform fee has been deducted from the sale price.
              </p>
            </div>
            
            <div class="footer">
              <p>&gt;&gt; BLOCKCHAIN_VERIFIED_TRANSACTION</p>
              <p>This is an automated message from Ripework. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Ripework <transaction@mail.ripework.xyz>',
        to: [payload.recipientEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailData = await emailResponse.json();

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('Error sending email:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});