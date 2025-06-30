import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';

const upload = multer({ 
  dest: '/tmp/',
  limits: { fileSize: 700 * 1024, files: 5 } // 700KB por archivo, máximo 5 archivos
});

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
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Una o más imágenes superan el tamaño máximo permitido (1MB).' });
      }
      return res.status(500).json({ error: err.message });
    }

    try {
      const datos = req.body;
      const files = req.files;

      // Validar tamaño total de archivos
      let totalSize = 0;
      for (const campo in files) {
        const file = files[campo][0];
        totalSize += file.size;
      }
      if (totalSize > 3.5 * 1024 * 1024) { // 3.5MB
        // Borra los archivos temporales
        for (const campo in files) {
          fs.unlinkSync(files[campo][0].path);
        }
        return res.status(400).json({ error: 'La suma de todas las imágenes no debe superar 3.5MB.' });
      }

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
Edad: ${datos.edad}
¿Es estudiante?: ${datos.estudiante}
¿Tiene pasaporte vigente?: ${datos.pasaporte}
Teléfono modelo: ${datos.telefono_modelo}
Teléfono representante: ${datos.telefono_representante}
Altura: ${datos.altura}
Instagram: ${datos.instagram}
Región: ${datos.region}
Dirección: ${datos.direccion}
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