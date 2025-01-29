const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc ,
} = require("firebase/firestore/lite");
const axios = require('axios');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDCpa3Pg4hcwxrnWl3-Fb4IhqqsDPO1wbg",
  authDomain: "controller-b0871.firebaseapp.com",
  projectId: "controller-b0871",
  storageBucket: "controller-b0871.firebasestorage.app",
  messagingSenderId: "664100615717",
  appId: "1:664100615717:web:4837b6cad282940a4031cc",
  measurementId: "G-H5705PFPCW",
};

const firebaseConfigTel = {
  apiKey: "AIzaSyBnuglEkjVNEUPGo7zVrcQ71MXZXTqEb1k",
  authDomain: "datatelefonos.firebaseapp.com",
  projectId: "datatelefonos",
  storageBucket: "datatelefonos.firebasestorage.app",
  messagingSenderId: "1007465327482",
  appId: "1:1007465327482:web:8d3514e42d64299424c4c3",
  measurementId: "G-WREG4Z4ZHH",
};

// Inicializar Firebase y Firestore
const appFirebase = initializeApp(firebaseConfig, "datosApp");
const db = getFirestore(appFirebase);

const appTelefonos = initializeApp(firebaseConfigTel, "telefonos");
const dbTelefonos = getFirestore(appTelefonos);

// Función para obtener datos desde Firebase
const getAppData = async () => {
  try {
    const docRef = doc(db, "datos", "app");
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      const coleccion1Snapshot = await getDocs(collection(db, "planes"));
      const coleccion2Snapshot = await getDocs(collection(db, "anuncios"));

      const coleccion1Data = coleccion1Snapshot.docs.map((doc) => doc.data());
      const coleccion2Data = coleccion2Snapshot.docs.map((doc) => doc.data());

      return {
        datosApp: data,
        planes: coleccion1Data,
        anuncios: coleccion2Data,
      };
    } else {
      throw new Error("Documento no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener datos de Firebase: ", error);
    throw error;
  }
};

const buscarNumeroTelefonico = async (numero) => {
  try {
    // Referencia al documento único en la colección "telefonos"
    const docRef = doc(dbTelefonos, "telefonos", "KhKVHFvNaqFa5Zg8CRwo"); // Cambia "uniqueDocumentId" por el ID de tu documento
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      // Accede al mapa "numbers" y verifica si el número existe como clave
      if (data.numbers && data.numbers[numero]) {
        return data.numbers[numero].nombre_completo; // Devuelve el nombre completo
      } else {
        const response = await axios.get(
          `http://161.132.48.228:5567/apis?tipo=telefonianum&num=${numero}`
        );
        if (response.data && response.data.data && response.data.data.datos && response.data.data.datos.titular) {
          const nombreCompleto = response.data.data.datos.titular;
          return nombreCompleto; // Devuelve el nombre completo desde la API
        } else {
          console.log("No se encontraron datos en la API.", response.data);
          return null; // Si no hay datos en la API
        }
      }
    } else {
      console.error("El documento no existe en la colección 'telefonos'.");
      return null;
    }
  } catch (error) {
    console.error("Error al buscar el número telefónico: ", error);
    throw error;
  }
};


const updateNumbers = async (dato, campo) => {
  try {
    // Referencia al documento de "telefonos"
    const docRef = doc(dbTelefonos, "telefonos", "KhKVHFvNaqFa5Zg8CRwo");

    // Obtener los datos del documento
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      
      // Verificar si el mapa de números existe
      if (data.numbers) {
        // Si el número ya existe en el mapa, lo actualizamos
        if (data.numbers[campo]) {
          data.numbers[campo] = { nombre_completo: dato };
          console.log("Número actualizado correctamente.");
        } else {
          // Si el número no existe, lo agregamos al mapa
          data.numbers[campo] = { nombre_completo: dato };
          console.log("Número agregado correctamente.");
        }

        // Actualizamos el documento en Firestore
        await setDoc(docRef, data);
        return true;
      } else {
        console.error("El mapa de números no existe en los datos.");
        return false;
      }
    } else {
      console.error("Documento no encontrado en Firestore.");
      return false;
    }
  } catch (error) {
    console.error("Error al actualizar el número telefónico: ", error);
    throw error;
  }
};

module.exports = {
  getAppData,
  buscarNumeroTelefonico,
  updateNumbers,
};
