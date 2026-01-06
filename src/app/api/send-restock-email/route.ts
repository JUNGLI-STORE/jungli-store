import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { subscribers, productId, productName, productImage } = await req.json();

    const emailPromises = subscribers.map((sub: any) => 
      resend.emails.send({
        from: 'JUNGLI <drop@jungli.store>',
        to: sub.email,
        subject: `🔥 BACK IN STASH: ${productName}`,
        html: `
          <div style="background-color: #f3f4f6; padding: 30px; font-family: 'Helvetica', sans-serif;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; border: 8px solid black; padding: 40px; box-shadow: 15px 15px 0px #FF5F1F;">
              
              <h1 style="text-transform: uppercase; font-style: italic; font-weight: 900; font-size: 32px; line-height: 1; margin-bottom: 20px; color: black;">
                STASH <span style="color: #FF5F1F;">REFILLED.</span>
              </h1>

              <p style="font-weight: bold; font-size: 16px; color: #374151; margin-bottom: 25px; text-transform: uppercase;">
                The ${productName} is back in the vault. We've secured a fresh batch just for you.
              </p>

              <!-- PRODUCT IMAGE -->
              <div style="border: 4px solid black; background-color: #f9fafb; margin-bottom: 30px; padding: 10px; text-align: center;">
                <img src="${productImage}" alt="${productName}" style="width: 100%; max-width: 300px; height: auto;" />
              </div>

              <!-- DIRECT REDIRECT LINK -->
              <a href="https://jungli.store/shop/${productId}" style="display: block; text-align: center; background-color: black; color: white; padding: 20px; border: 4px solid #FF5F1F; text-decoration: none; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 18px; box-shadow: 5px 5px 0px #FF5F1F;">
                SECURE YOUR PAIR NOW —&gt;
              </a>

              <p style="margin-top: 30px; font-size: 10px; color: #9ca3af; text-transform: uppercase; font-weight: bold; text-align: center;">
                Demand is high. First come, first stashed.
              </p>
              
            </div>
          </div>
        `
      })
    );

    await Promise.all(emailPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}