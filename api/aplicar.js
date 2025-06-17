import formidable from 'formidable';
import fs from 'fs';
import { MailerSend, EmailParams, Recipient, Attachment } from 'mailersend';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const form = new formidable.IncomingForm({ uploadDir: './tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    try {
      // Prepara los adjuntos para Mailersend
      const attachments = [];
      for (const key in files) {
        const file = files[key];
        const content = fs.readFileSync(file.filepath, { encoding: 'base64' });
        attachments.push(
          new Attachment(file.originalFilename, content)
        );
      }

      const mailersend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY,
      });

      const recipients = [new Recipient('molewaka22@gmail.com', 'TMI')];

      const emailParams = new EmailParams()
        .setFrom(process.env.EMAIL_USER) // Debe ser un remitente verificado en Mailersend
        .setFromName('TMI Web')
        .setRecipients(recipients)
        .setSubject('Nueva postulación de modelo')
        .setText(`
Nueva postulación recibida:

Nombre: ${fields.name}
Género: ${fields.genero}
Altura: ${fields.altura}
Edad: ${fields.edad}
Instagram: ${fields.instagram}
Región: ${fields.region}
Email: ${fields.email}
        `)
        .setAttachments(attachments);

      await mailersend.send(emailParams);

      // Borra los archivos temporales
      attachments.forEach((att, idx) => {
        const file = files[Object.keys(files)[idx]];
        fs.unlinkSync(file.filepath);
      });

      res.status(200).json({
        mensaje: '✔️ Postulación enviada correctamente.'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}