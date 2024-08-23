const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

const conexion = mysql.createConnection({
  host: 'localhost',
  database: 'usuarios_db',
  user: 'root',
  password: ''
});

conexion.connect(function(error) {
  if (error) {
    throw error;
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'inicio.html'));
});

app.post('/submit', (req, res) => {
  const {
    nombres,
    apellidos,
    tipo_documento,
    numero_documento,
    edad,
    tipo_sangre,
    contacto,
    correo,
    confirmacion_correo,
    genero,
    ciudad,
    direccion,
    ruta
  } = req.body;

  // Este es para crear el registro en la base desde el formulario
  const query = `
    INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, edad, tipo_sangre, contacto, correo, genero, ciudad, direccion, ruta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  conexion.query(query, [nombres, apellidos, tipo_documento, numero_documento, edad, tipo_sangre, contacto, correo, genero, ciudad, direccion, ruta], (err, result) => {
    if (err) {
      console.error('Error al insertar Registro:', err.stack);
      res.status(500).send('Error al insertar Registro');
      return;
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
          <title>Registro Exitoso</title>
      </head>
      <body>
          <div class="container mt-5">
              <h3>¡Registro exitoso!</h3>
              <a href="/usuarios" class="btn btn-success">Usuarios Registrados</a>
          </div>
      </body>
      </html>
    `);
  });
});
//Consulta para ver los registros en la tabla 
app.get('/usuarios', (req, res) => {
  conexion.query('SELECT * FROM usuarios', function(error, results) {
    if (error) {
      res.status(500).send('Error al obtener datos');
      return;
    }

    let html = `
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
          <title>Lista de Usuarios</title>
      </head>
      <body>
          <div class="container mt-5">
              <h1>Lista de Usuarios</h1>
              <table class="table table-striped">
                  <thead class="thead-dark">
                      <tr>
                          <th>Nombres</th>
                          <th>Apellidos</th>
                          <th>Tipo de Documento</th>
                          <th>Número de Documento</th>
                          <th>Edad</th>
                          <th>Tipo de Sangre</th>
                          <th>Contacto</th>
                          <th>Correo</th>
                          <th>Género</th>
                          <th>Ciudad</th>
                          <th>Dirección</th>
                          <th>Ruta</th>
                          <th>Acciones</th>
                      </tr>
                  </thead>
                  <tbody>
    `;

    results.forEach((result) => {
      html += `
        <tr>
            <td>${result.nombres}</td>
            <td>${result.apellidos}</td>
            <td>${result.tipo_documento}</td>
            <td>${result.numero_documento}</td>
            <td>${result.edad}</td>
            <td>${result.tipo_sangre}</td>
            <td>${result.contacto}</td>
            <td>${result.correo}</td>
            <td>${result.genero}</td>
            <td>${result.ciudad}</td>
            <td>${result.direccion}</td>
            <td>${result.ruta}</td>
            <td>
                <a href="/edit/${result.id}" class="btn btn-warning">Editar</a>
            </td>
        </tr>
      `;
    });

    html += `
                  </tbody>
              </table>
              <a href="/" class="btn btn-primary">Nuevo Registro</a>
          </div>
      </body>
      </html>
    `;

    res.send(html);
  });
});
// Editar registro
app.get('/edit/:id', (req, res) => {
  const userId = req.params.id;
  
  conexion.query('SELECT * FROM usuarios WHERE id = ?', [userId], (error, results) => {
    if (error) {
      res.status(500).send('Error al obtener datos del usuario');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).send('Usuario no encontrado');
      return;
    }
    
    const user = results[0];
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
          <title>Editar Usuario</title>
      </head>
      <body>
          <div class="container mt-5">
              <h1>Editar Usuario</h1>
              <form action="/update/${user.id}" method="post">
                  <div class="form-group">
                      <label for="nombres">Nombres:</label>
                      <input type="text" class="form-control" id="nombres" name="nombres" value="${user.nombres}" required>
                  </div>
                  <div class="form-group">
                      <label for="apellidos">Apellidos:</label>
                      <input type="text" class="form-control" id="apellidos" name="apellidos" value="${user.apellidos}" required>
                  </div>
                  <div class="form-group">
                      <label for="tipo_documento">Tipo de Documento:</label>
                      <select class="form-control" id="tipo_documento" name="tipo_documento" required>
                          <option value="cedula de ciudadanía" ${user.tipo_documento === 'cedula de ciudadanía' ? 'selected' : ''}>Cédula de Ciudadanía</option>
                          <option value="cedula de extranjería" ${user.tipo_documento === 'cedula de extranjería' ? 'selected' : ''}>Cédula de Extranjería</option>
                          <option value="pasaporte" ${user.tipo_documento === 'pasaporte' ? 'selected' : ''}>Pasaporte</option>
                          <option value="tarjeta de identidad" ${user.tipo_documento === 'tarjeta de identidad' ? 'selected' : ''}>Tarjeta de Identidad</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label for="numero_documento">Número de Documento:</label>
                      <input type="text" class="form-control" id="numero_documento" name="numero_documento" value="${user.numero_documento}" required>
                  </div>
                  <div class="form-group">
                      <label for="edad">Edad:</label>
                      <input type="number" class="form-control" id="edad" name="edad" value="${user.edad}" required>
                  </div>
                  <div class="form-group">
                      <label for="tipo_sangre">Tipo de Sangre:</label>
                      <select class="form-control" id="tipo_sangre" name="tipo_sangre" required>
                          <option value="A+" ${user.tipo_sangre === 'A+' ? 'selected' : ''}>A+</option>
                          <option value="A-" ${user.tipo_sangre === 'A-' ? 'selected' : ''}>A-</option>
                          <option value="B+" ${user.tipo_sangre === 'B+' ? 'selected' : ''}>B+</option>
                          <option value="B-" ${user.tipo_sangre === 'B-' ? 'selected' : ''}>B-</option>
                          <option value="O+" ${user.tipo_sangre === 'O+' ? 'selected' : ''}>O+</option>
                          <option value="O-" ${user.tipo_sangre === 'O-' ? 'selected' : ''}>O-</option>
                          <option value="AB+" ${user.tipo_sangre === 'AB+' ? 'selected' : ''}>AB+</option>
                          <option value="AB-" ${user.tipo_sangre === 'AB-' ? 'selected' : ''}>AB-</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label for="contacto">Contacto:</label>
                      <input type="text" class="form-control" id="contacto" name="contacto" value="${user.contacto}" required>
                  </div>
                  <div class="form-group">
                      <label for="correo">Correo:</label>
                      <input type="email" class="form-control" id="correo" name="correo" value="${user.correo}" required>
                  </div>
                  <div class="form-group">
                      <label for="genero">Género:</label>
                      <input type="text" class="form-control" id="genero" name="genero" value="${user.genero}" required>
                  </div>
                  <div class="form-group">
                      <label for="ciudad">Ciudad:</label>
                      <input type="text" class="form-control" id="ciudad" name="ciudad" value="${user.ciudad}" required>
                  </div>
                  <div class="form-group">
                      <label for="direccion">Dirección:</label>
                      <input type="text" class="form-control" id="direccion" name="direccion" value="${user.direccion}" required>
                  </div>
                  <div class="form-group">
                      <label for="ruta">Ruta:</label>
                      <input type="text" class="form-control" id="ruta" name="ruta" value="${user.ruta}" required>
                  </div>
                  <button type="submit" class="btn btn-primary">Actualizar</button>
              </form>
          </div>
      </body>
      </html>
    `);
  });
});

app.post('/update/:id', (req, res) => {
  const userId = req.params.id;
  const {
    nombres,
    apellidos,
    tipo_documento,
    numero_documento,
    edad,
    tipo_sangre,
    contacto,
    correo,
    genero,
    ciudad,
    direccion,
    ruta
  } = req.body;
//Aca se hacer realmente la actualización del registro 
  const query = `
    UPDATE usuarios
    SET nombres = ?, apellidos = ?, tipo_documento = ?, numero_documento = ?, edad = ?, tipo_sangre = ?, contacto = ?, correo = ?, genero = ?, ciudad = ?, direccion = ?, ruta = ?
    WHERE id = ?
  `;

  conexion.query(query, [nombres, apellidos, tipo_documento, numero_documento, edad, tipo_sangre, contacto, correo, genero, ciudad, direccion, ruta, userId], (err, result) => {
    if (err) {
      console.error('Error al actualizar datos:', err.stack);
      res.status(500).send('Error al actualizar datos');
      return;
    }

    res.redirect('/usuarios');
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
