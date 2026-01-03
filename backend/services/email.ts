import nodemailer from 'nodemailer';

interface EmailConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
}

function getEmailConfig(): EmailConfig {
    return {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || 'noreply@batalj.com'
    };
}

export async function sendInviteEmail(email: string, groupSlug: string, groupName: string, token: string): Promise<void> {
    const config = getEmailConfig();

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        auth: {
            user: config.user,
            pass: config.password
        }
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/group/${groupSlug}?token=${token}`;

    await transporter.sendMail({
        from: config.from,
        to: email,
        subject: `Du är inbjuden till ${groupName} på Batalj`,
        html: `
            <h1>Du har blivit inbjuden!</h1>
            <p>Du har blivit inbjuden att gå med i gruppen <strong>${groupName}</strong> på Batalj.</p>
            <p>Klicka på länken nedan för att gå med:</p>
            <p><a href="${inviteUrl}">${inviteUrl}</a></p>
            <br>
            <p>Hälsningar,<br>Batalj-teamet</p>
        `
    });
}
