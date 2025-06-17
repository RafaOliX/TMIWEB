import formidable from 'formidable';
import fs from 'fs';
import nodemailer from 'nodemailer';

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
      // Prepara los adjuntos
      const attachments = [];
      for (const key in files) {
        const file = files[key];
        attachments.push({
          filename: file.originalFilename,
          path: file.filepath,
        });
      }

      // Configura el transporte SMTP de Mailersend
      const transporter = nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587,
        secure: false,
        auth: {
          user: 'admin@test-2p0347z8rn3lzdrn.mlsender.net',
          pass: process.env.MAILERSEND_SMTP_PASS, // Pon tu contraseña SMTP en Vercel
        },
      });

      // Prepara el mensaje
      const mailOptions = {
        from: '"TMI Web" <admin@test-2p0347z8rn3lzdrn.mlsender.net>',
        to: 'molewaka22@gmail.com',
        subject: 'Nueva postulación de modelo',
        text: `
Nueva postulación recibida:

Nombre: ${fields.name}
Género: ${fields.genero}
Altura: ${fields.altura}
Edad: ${fields.edad}
Instagram: ${fields.instagram}
Región: ${fields.region}
Email: ${fields.email}
        `,
        attachments: attachments,
      };

      await transporter.sendMail(mailOptions);

      // Borra los archivos temporales
      attachments.forEach(att => fs.unlinkSync(att.path));

      res.status(200).json({
        mensaje: '✔️ Postulación enviada correctamente.'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}