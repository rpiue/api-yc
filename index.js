const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { getAppData, buscarNumeroTelefonico, updateNumbers } = require("./datos-app");
const {
  getUserData,
  getUserByEmail,
  updateUserData,
  guardarUsuario,
} = require("./datos-usuario");

// Configurar servidor
const app = express();
const port = 3000;

// Clave secreta
const JWT_SECRET = "your_jwt_secret";

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Middleware para verificar tokens
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    console.log("No token provided")
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded; // Guardar información del usuario decodificada
    next();
  });
};

// Ruta para autenticar y enviar un token a la app Flutter
app.post("/index", (req, res) => {
  const { appKey } = req.body;

  if (appKey === "flutter_secret_key") {
    const token = jwt.sign({ user: "flutter_user" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }

  return res.status(401).json({ error: "Unauthorized" });
});

// Ruta para obtener información de Firebase
app.get("/datosApp", verifyToken, async (req, res) => {
  try {
    const firebaseResponse = await getAppData();
    res.status(200).json({
      datosApp: firebaseResponse.datosApp,
      planes: firebaseResponse.planes,
      anuncios: firebaseResponse.anuncios,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener datos de usuario
app.get("/datosUsuario", verifyToken, async (req, res) => {
  const { userID } = req.query;
  try {
    const firebaseResponse = await getUserData(userID);
    res.status(200).json({ firebaseResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener usuario por email
app.get("/login", verifyToken, async (req, res) => {
  const { email } = req.query;
  try {
    const firebaseResponse = await getUserByEmail(email);
    res.status(200).json({ firebaseResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar datos de usuario
app.get("/update", verifyToken, async (req, res) => {
  const { email, dato, campo } = req.query;

  if (!email || !dato || !campo) {
    return res.status(400).json({
      error: "Todos los parámetros (email, dato, campo) son obligatorios.",
    });
  }

  try {
    let parsedDato;
    try {
      // Intentar parsear el dato como JSON
      parsedDato = JSON.parse(dato);
    } catch (e) {
      // Si falla, asumir que es texto
      parsedDato = dato;
    }

    // Actualizar Firestore
    const result = await updateUserData(email, parsedDato, campo);

    if (result) {
      res.status(200).json({
        message: "Usuario actualizado exitosamente.",
        updatedField: campo,
        newValue: parsedDato,
      });
    } else {
      res.status(404).json({
        error: "Usuario no encontrado o no se pudo actualizar el dato.",
      });
    }
  } catch (error) {
    console.error("Error al actualizar el usuario:", error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get("/updateT", verifyToken, async (req, res) => {
  const { dato, campo } = req.query;

  if (!dato || !campo) {
    return res.status(400).json({
      error: "Todos los parámetros (email, dato, campo) son obligatorios.",
    });
  }

  try {
    let parsedDato;
    try {
      // Intentar parsear el dato como JSON
      parsedDato = JSON.parse(dato);
    } catch (e) {
      // Si falla, asumir que es texto
      parsedDato = dato;
    }

    // Actualizar Firestore
    const result = await updateNumbers(parsedDato, campo);

    if (result) {
      res.status(200).json({
        message: "Usuario actualizado exitosamente.",
        updatedField: campo,
        newValue: parsedDato,
      });
    } else {
      res.status(404).json({
        error: "Usuario no encontrado o no se pudo actualizar el dato.",
      });
    }
  } catch (error) {
    console.error("Error al actualizar el usuario:", error.message);
    res.status(500).json({ error: error.message });
  }
});



// Ruta para crear un nuevo usuario
app.post("/crearUsuario", verifyToken, async (req, res) => {
  const { nombre, apellidos, email, telefono, saldo, codigo_v } = req.body;

  // Validar que todos los campos estén presentes
  if (!nombre || !apellidos || !email || !telefono || saldo === undefined) {
    return res.status(400).json({
      error: "Todos los campos (nombres, apellidos, email, telefono, saldo) son obligatorios.",
    });
  }

  try {
    // Aquí puedes implementar la lógica para guardar los datos en Firestore
    const nuevoUsuario = {
      nombre,
      apellidos,
      email,
      telefono,
      saldo,
      codigo_v,
    };

    // Supongamos que hay una función `guardarUsuario` que guarda en Firebase
    const idUsuario = await guardarUsuario(nuevoUsuario);

    res.status(201).json({
      message: "Usuario creado exitosamente.",
      usuario: nuevoUsuario,
      id: idUsuario,
    });
  } catch (error) {
    console.error("Error al crear el usuario:", error.message);
    res.status(500).json({ error: error.message });
  }
});


app.post("/telefono", verifyToken, async (req, res) => {
  const { telefono } = req.body;
  console.log("Se hizo aqui la telefono 2")

  // Validación: Verificar si se envió el número telefónico
  if (!telefono) {
    return res.status(400).json({ mensaje: 'El parámetro "telefono" es obligatorio' });
  }

  try {
    // Llama a la función para buscar el número telefónico
    const nombreCompleto = await buscarNumeroTelefonico(telefono);

    if (nombreCompleto) {
      // Respuesta con el nombre completo si se encuentra el número
      return res.json({
        success: true,
        mensaje: "Número encontrado",
        data: {
          telefono,
          nombreCompleto,
        },
      });
    } else {
      // Respuesta si el número no se encuentra
      return res.status(404).json({
        success: false,
        mensaje: "Número no encontrado",
        data: null,
      });
    }
  } catch (error) {
    console.error("Error al consultar:", error.message || error);

    // Respuesta en caso de error del servidor
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: error.message || "Error desconocido",
    });
  }
});



app.get('/hora-peru', (req, res) => {
  const moment = require('moment-timezone');
  // Obtener la fecha y hora actual en la zona horaria de Lima, Perú
  const ahoraPeru = moment().tz('America/Lima').format('YYYY-MM-DD HH:mm:ss');

  res.json({
    hora: ahoraPeru,
    zona: 'America/Lima'
  });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
