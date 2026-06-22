import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientName, doctorName, date, time, phone, templateType = 'confirm' } = body;

    if (!patientName || !doctorName || !date || !time || !phone) {
      return NextResponse.json(
        { error: "Missing required parameters: patientName, doctorName, date, time, phone" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.DLT_SENDER_ID || "TICARE";

    let templateId = process.env.APPOINTMENT_CONFIRM_TEMPLATE_ID;
    if (templateType === 'reminder') {
      templateId = process.env.APPOINTMENT_REMINDER_TEMPLATE_ID;
    } else if (templateType === 'cancel') {
      templateId = process.env.APPOINTMENT_CANCEL_TEMPLATE_ID;
    }

    if (!apiKey || !templateId) {
      console.log(`📬 [SMS API MOCK] Direct send triggered:`);
      console.log(`   Recipient: ${phone}`);
      console.log(`   Variables: Patient=${patientName}, Doctor=${doctorName}, Date=${date}, Time=${time}`);
      return NextResponse.json({
        success: true,
        mocked: true,
        message: "SMS API Key or Template ID missing. Mock send logged to terminal."
      });
    }

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "dlt",
        sender_id: senderId,
        message: templateId,
        variables_values: `${patientName}|${doctorName}|${date}|${time}`,
        numbers: phone,
      }),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (err: any) {
    console.error("Error in SMS send API route:", err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
