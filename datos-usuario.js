const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  Timestamp ,
} = require("firebase/firestore/lite");

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAImehLPFTGMupcVxuzNNyWkrkkB6utx34",
  authDomain: "apppagos-1ec3f.firebaseapp.com",
  projectId: "apppagos-1ec3f",
  storageBucket: "apppagos-1ec3f.appspot.com",
  messagingSenderId: "296133590526",
  appId: "1:296133590526:web:a47a8e69d5e9bfa26bd4af",
  measurementId: "G-5QZSJN2S1Z",
};

// Inicializar Firebase y Firestore
const appFirebase = initializeApp(firebaseConfig, "datosUsuario");
const db = getFirestore(appFirebase);

const obtenerFechas = () => {
  const zonaHoraria = "America/Lima";

  // Fecha actual en la zona horaria específica
  const fechaActual = new Date(new Date().toLocaleString("en-US", { timeZone: zonaHoraria }));

  // Calcular fecha final al siguiente mes
  const fechaFinal = new Date(fechaActual);
  fechaFinal.setMonth(fechaFinal.getMonth() + 1);

  // Ajustar días al final del mes si es necesario
  if (fechaFinal.getDate() !== fechaActual.getDate()) {
    fechaFinal.setDate(0);
  }

  // Convertir fechas a Firebase Timestamps
  return {
    fechaActual: Timestamp.fromDate(fechaActual),
    fechaFinal: Timestamp.fromDate(fechaFinal),
  };
}
// Función para obtener usuario desde Firebase
const getUserData = async (userID) => {
  try {
    const docRef = doc(db, "usuarios", userID);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      console.log(data);

      return {
        data,
      };
    } else {
      throw new Error("Documento no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener datos de Firebase: ", error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  console.log("Lo q esta en email:", email);

  try {
    const usuariosCollection = collection(db, "usuarios");
    const q = query(usuariosCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const results = [];
      console.log("Lo q esta en querySnapshot\n", querySnapshot);
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      console.log(results);
      return results;
    } else {
      throw new Error("No se encontró ningún usuario con ese email");
    }
  } catch (error) {
    console.error("Error al buscar usuario por email: ", error);
    throw error;
  }
};

const updateUserData = async (docID, data, campo) => {
  try {
    const docRef = doc(db, "usuarios", docID);

    // Verificar si el documento existe
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`El documento con ID: ${docID} no existe.`);
    }

    // Actualización parcial
    const actualizacion = {};
    actualizacion[campo] = data;

    await updateDoc(docRef, actualizacion);
    console.log(
      `Actualización exitosa para el usuario con ID: ${docID} en el campo '${campo}'`
    );
    return true;

  } catch (error) {
    console.error(
      `Error al actualizar el campo '${campo}' en Firestore:`,
      error
    );
    throw error;
  }
};

async function guardarUsuario(usuario) {
  try {
    const usuariosRef = collection(db, "usuarios");

    // Verificar duplicados por email
    const emailQuery = query(usuariosRef, where("email", "==", usuario.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      throw new Error("Ya existe un usuario con este correo.");
    }

    // Verificar duplicados por teléfono
    const telefonoQuery = query(
      usuariosRef,
      where("telefono", "==", usuario.telefono)
    );
    const telefonoSnapshot = await getDocs(telefonoQuery);
    if (!telefonoSnapshot.empty) {
      throw new Error("Ya existe un usuario con este teléfono.");
    }

    //datos adicionales
    usuario.plan = "Sin Plan";
    usuario.clave = "";
    usuario.eliminado = false;
    usuario.inicio = false;
    usuario.dispositivos = {
      1: "",
    };

    
    const { fechaActual, fechaFinal } = obtenerFechas();
    usuario.fecha_inicial = fechaActual;
    usuario.fecha_final = fechaFinal;
    usuario.contactos = {};
    usuario.contactos = {};
    usuario.crear_contacto = false;
    usuario.QR = false;
    usuario.pedir = false;
    usuario.gmail = false;
    usuario.bcp = false;
    usuario.ruta = "/storage/emulated/0/DCIM/";
    usuario.sms = false;
    usuario.vendedor = false;
    // Si no hay duplicados, guardar el usuario
    const docRef = await addDoc(usuariosRef, usuario);
    console.log("Usuario guardado correctamente:", usuario);
    console.log("Usuario guardado correctamente con ID:", docRef.id);
    if (docRef && docRef.id) {
      return docRef.id;
    }

    return null;
  } catch (error) {
    console.error("Error al guardar el usuario:", error);
    throw error;
  }
}

module.exports = {
  getUserData,
  getUserByEmail,
  updateUserData,
  guardarUsuario,
};
