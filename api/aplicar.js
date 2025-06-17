import formidable from 'formidable';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      // Sube los archivos a Cloudinary y guarda los enlaces
      const fileLinks = [];
      for (const key in files) {
        const file = files[key];
        const upload = await cloudinary.uploader.upload(file.filepath, {
          folder: 'tmiweb',
          resource_type: 'auto',
        });
        fileLinks.push(upload.secure_url);
        fs.unlinkSync(file.filepath); // Borra el archivo temporal
      }

      // Configura el transporte SMTP de Mailersend
      const transporter = nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587,
        secure: false,
        auth: {
          user: 'admin@test-2p0347z8rn3lzdrn.mlsender.net',
          pass: process.env.MAILERSEND_SMTP_PASS,
        },
      });

      // Prepara el mensaje con los enlaces de Cloudinary
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

Archivos adjuntos:
${fileLinks.map(link => `- ${link}`).join('\n')}
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        mensaje: '✔️ Postulación enviada correctamente.',
        archivos: fileLinks,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}