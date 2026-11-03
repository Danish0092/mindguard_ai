
export async function sendVerificationCode(
  email: string,
  code: string,
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME ?? "MindGuard AI";

  if (!apiKey || !fromEmail) {
    throw new Error("Brevo email environment variables are missing.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [{ email }],
      subject: "Your MindGuard AI verification code",
      textContent: `Your verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
          <h2>MindGuard AI</h2>
          <p>Use the verification code below to complete registration.</p>
          <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this code, ignore this email.</p>
        </div>
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Brevo email error:", response.status, details);
    throw new Error("Unable to send verification email.");
  }
}
