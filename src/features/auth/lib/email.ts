// Library for sending authentication-related emails, such as password reset emails
import { Resend } from "resend";

export async function sendResetEmail(email: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send reset emails");
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "JodMe <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <title>Reset your password - JodMe</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f1f5f9;
        font-family: Arial, Helvetica, sans-serif;
        color: #0f172a;
      ">

        <!-- Hidden preview text -->
        <div style="
          display: none;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
        ">
          Reset your JodMe password. This link expires in 15 minutes.
        </div>

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background-color: #f1f5f9;"
        >
          <tr>
            <td align="center" style="padding: 36px 16px;">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="max-width: 560px;"
              >
                <!-- Brand -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="
                      font-size: 28px;
                      line-height: 36px;
                      font-weight: 800;
                      letter-spacing: -0.8px;
                      color: #0f172a;
                    ">
                      <span style="color: #0d9488;">✦</span>
                      JodMe
                    </div>

                    <p style="
                      margin: 8px 0 0;
                      color: #64748b;
                      font-size: 14px;
                      line-height: 21px;
                    ">
                      Account security
                    </p>
                  </td>
                </tr>

                <!-- Main card -->
                <tr>
                  <td
                    style="
                      background-color: #ffffff;
                      border: 1px solid #e2e8f0;
                      border-radius: 16px;
                      padding: 36px 32px;
                    "
                  >
                    <!-- Icon -->
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td
                          width="52"
                          height="52"
                          align="center"
                          valign="middle"
                          style="
                            width: 52px;
                            height: 52px;
                            background-color: #eef2ff;
                            border-radius: 14px;
                            color: #4f46e5;
                            font-size: 25px;
                          "
                        >
                          &#128274;
                        </td>
                      </tr>
                    </table>

                    <h1 style="
                      margin: 24px 0 12px;
                      color: #0f172a;
                      font-size: 26px;
                      line-height: 34px;
                      font-weight: 750;
                      letter-spacing: -0.5px;
                    ">
                      Reset your password
                    </h1>

                    <p style="
                      margin: 0 0 24px;
                      color: #475569;
                      font-size: 15px;
                      line-height: 25px;
                    ">
                      We received a request to reset the password
                      for your JodMe account. Click the button below
                      to create a new password.
                    </p>

                    <!-- CTA button -->
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-bottom: 20px;"
                    >
                      <tr>
                        <td align="center" bgcolor="#4f46e5"
                          style="border-radius: 10px;"
                        >
                          <a
                            href="${link}"
                            target="_blank"
                            style="
                              display: block;
                              padding: 15px 24px;
                              color: #ffffff;
                              font-size: 15px;
                              line-height: 22px;
                              font-weight: 700;
                              text-align: center;
                              text-decoration: none;
                              border-radius: 10px;
                            "
                          >
                            Reset Password &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry notice -->
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-bottom: 24px;
                        background-color: #fffbeb;
                        border: 1px solid #fef3c7;
                        border-radius: 8px;
                      "
                    >
                      <tr>
                        <td style="
                          padding: 12px 14px;
                          color: #92400e;
                          font-size: 13px;
                          line-height: 20px;
                        ">
                          <strong>Time-sensitive:</strong>
                          This password reset link expires in
                          <strong>15 minutes</strong>.
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback URL -->
                    <p style="
                      margin: 0 0 8px;
                      color: #64748b;
                      font-size: 13px;
                      line-height: 21px;
                    ">
                      If the button doesn't work, copy and paste
                      the following link into your browser:
                    </p>

                    <p style="
                      margin: 0 0 24px;
                      word-break: break-all;
                      overflow-wrap: anywhere;
                      font-size: 13px;
                      line-height: 21px;
                    ">
                      <a
                        href="${link}"
                        target="_blank"
                        style="
                          color: #4f46e5;
                          text-decoration: underline;
                        "
                      >${link}</a>
                    </p>

                    <!-- Security note -->
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        background-color: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 10px;
                      "
                    >
                      <tr>
                        <td style="padding: 16px;">
                          <p style="
                            margin: 0 0 6px;
                            color: #334155;
                            font-size: 13px;
                            line-height: 20px;
                            font-weight: 700;
                          ">
                            &#128737; Security notice
                          </p>

                          <p style="
                            margin: 0;
                            color: #64748b;
                            font-size: 13px;
                            line-height: 21px;
                          ">
                            If you didn't request a password reset,
                            you can safely ignore this email.
                            Your password will remain unchanged.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 24px 12px 0;">
                    <p style="
                      margin: 0 0 6px;
                      color: #64748b;
                      font-size: 13px;
                      line-height: 20px;
                    ">
                      Sent automatically by JodMe.
                    </p>

                    <p style="
                      margin: 0;
                      color: #94a3b8;
                      font-size: 12px;
                      line-height: 19px;
                    ">
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
      `,
  });
}
