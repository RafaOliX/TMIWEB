const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

// Configura multer para archivos temporales
const upload = multer({ dest: 'uploads/' });

// Configura tu transporte de correo (ejemplo con Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.'rafaolix59@gmail.com',      // Cambia esto
    pass: process.env.'iptk ebko ugiw bqps',        // Usa una App Password si tienes 2FA
  },
});

// Ruta para recibir el formulario
app.post('/aplicar', upload.fields([
  { name: 'foto_retrato' },
  { name: 'foto_cuerpo_completo' },
  { name: 'foto_mitad_cintura' },
  { name: 'foto_lado_derecho' },
  { name: 'foto_lado_izquierdo' }
]), async (req, res) => {
    console.log('Formulario recibido', req.body, req.files); 
  try {
    const datos = req.body;
    const files = req.files;

    // Prepara los adjuntos
    const attachments = [];
    for (const campo in files) {
      const file = files[campo][0];
      attachments.push({
        filename: file.originalname,
        path: file.path,
      });
    }

    // Prepara el mensaje
    const mailOptions = {
      from: '"TMI Web" <rafaolix59@gmail.com>', // Cambia esto
      to: 'themodelissueclass@gmail.com',      // Tu correo de destino
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
      `,
      attachments: attachments,
    };

    // Envía el correo
    await transporter.sendMail(mailOptions);

    // Borra los archivos temporales
    attachments.forEach(att => fs.unlinkSync(att.path));

    res.json({ mensaje: '✔️ Postulación enviada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));