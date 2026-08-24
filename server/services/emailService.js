import { getResendClient } from '../config/resend.js';

/**
 * Send email when complaint status changes
 */
export const sendStatusUpdateEmail = async ({ residentEmail, residentName, complaintNumber, title, oldStatus, newStatus, note }) => {
  const resend = getResendClient();
  const fromEmail = process.env.EMAIL_FROM || 'Society Maintenance <onboarding@resend.dev>';
  
  const subject = `[Status Update] Complaint ${complaintNumber}: ${newStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb;">Society Maintenance Update</h2>
      <p>Hello <strong>${residentName}</strong>,</p>
      <p>The status of your complaint <strong>${complaintNumber} (${title})</strong> has been updated.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Previous Status:</strong> ${oldStatus || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: #16a34a; font-weight: bold;">${newStatus}</span></p>
        ${note ? `<p style="margin: 5px 0;"><strong>Admin Note:</strong> ${note}</p>` : ''}
      </div>

      <p style="color: #6b7280; font-size: 14px;">Log in to the Society Maintenance Portal to view full history details.</p>
    </div>
  `;

  if (!resend) {
    console.log(`\n================ [EMAIL NOTIFICATION AUDIT] ================`);
    console.log(`TO: ${residentEmail}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`STATUS CHANGE: ${oldStatus} -> ${newStatus} for ${complaintNumber}`);
    console.log(`NOTE: ${note || 'None'}`);
    console.log(`============================================================\n`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [residentEmail],
      subject,
      html,
    });
    console.log(`[Resend Email Sent]: ${data.id} to ${residentEmail}`);
    return { success: true, data };
  } catch (error) {
    console.error(`[Resend Email Error]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send email broadcast when important notice is posted
 */
export const sendImportantNoticeEmail = async ({ residentEmails, noticeTitle, noticeContent }) => {
  if (!residentEmails || residentEmails.length === 0) return;

  const resend = getResendClient();
  const fromEmail = process.env.EMAIL_FROM || 'Society Maintenance <onboarding@resend.dev>';
  
  const subject = `📌 [IMPORTANT NOTICE] ${noticeTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dc2626; border-radius: 8px;">
      <h2 style="color: #dc2626;">📌 Important Society Notice</h2>
      <h3 style="color: #1f2937;">${noticeTitle}</h3>
      <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px; margin: 15px 0;">
        <p style="white-space: pre-wrap; color: #374151;">${noticeContent}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This notice has been pinned to the Society Notice Board.</p>
    </div>
  `;

  if (!resend) {
    console.log(`\n================ [IMPORTANT NOTICE BROADCAST AUDIT] ================`);
    console.log(`RECIPIENTS: ${residentEmails.join(', ')}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT: ${noticeContent}`);
    console.log(`===================================================================\n`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: residentEmails,
      subject,
      html,
    });
    console.log(`[Resend Broadcast Notice Sent] to ${residentEmails.length} residents`);
    return { success: true, data };
  } catch (error) {
    console.error(`[Resend Broadcast Notice Error]: ${error.message}`);
    return { success: false, error: error.message };
  }
};
