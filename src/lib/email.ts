interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY no configurada: no se envía el email a ${to} ("${subject}").`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "ChollosTech <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!response.ok) {
      console.error("Error enviando email con Resend:", await response.text());
    }
  } catch (error) {
    console.error("Error enviando email con Resend:", error);
  }
}
