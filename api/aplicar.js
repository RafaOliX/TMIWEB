import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';

const upload = multer({ dest: '/tmp/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  upload.fields([
    { name: 'foto_retrato' },
    { name: 'foto_cuerpo_completo' },
    { name: 'foto_mitad_cintura' },
    { name: 'foto_lado_derecho' },
    { name: 'foto_lado_izquierdo' }
  ])(req, res, async function (err) {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const datos = req.body;
      const files = req.files;

      const attachments = [];
      for (const campo in files) {
        const file = files[campo][0];
        attachments.push({
          filename: file.originalname,
          path: file.path,
        });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"TMI Web😀" <${process.env.EMAIL_USER}>`,
        to: 'molewaka22@gmail.com', // Cambia esto al correo de destino
        subject: 'Nueva postulación de modelo',
        text: `
Nueva postulación recibida:

Nombre: ${datos.name}
Género: ${datos.genero}
Altura: ${datos.altura}
Edad: ${datos.edad}
Instagram: ${datos.instagram}
Región: ${datos.region}
Email: ${datos.email}
Enlaces: ${datos.enlace}
        `,
        attachments: attachments,
      };

      await transporter.sendMail(mailOptions);

      attachments.forEach(att => fs.unlinkSync(att.path));

      res.status(200).json({ mensaje: '✔️ Postulación enviada correctamente.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}