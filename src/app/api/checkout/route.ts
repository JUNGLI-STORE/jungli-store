import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// 1. Initialize Razorpay with your Secret Keys from .env.local
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: Request) {
  try {
    // 2. Get the total amount from the frontend request
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // 3. Define the Order options
    // NOTE: Razorpay accepts amount in PAISE (1 Rupee = 100 Paise)
    // So we multiply the amount by 100.
    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 100000)}`,
    };

    // 4. Create the order using the Razorpay SDK
    const order = await razorpay.orders.create(options);

    // 5. Return the order details to the frontend
    return NextResponse.json(order);

  } catch (error: any) {
    console.error("RAZORPAY ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order", details: error.message },
      { status: 500 }
    );
  }
}