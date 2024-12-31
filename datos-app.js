const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} = require("firebase/firestore/lite");

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

// Inicializar Firebase y Firestore
const appFirebase = initializeApp(firebaseConfig, "datosApp");
const db = getFirestore(appFirebase);

// Función para obtener datos desde Firebase
const getAppData = async () => {
  try {
    const docRef = doc(db, "datos", "app");
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

        const coleccion1Snapshot = await getDocs(collection(db, "planes"));
        const coleccion2Snapshot = await getDocs(collection(db, "anuncios"));

        const coleccion1Data = coleccion1Snapshot.docs.map((doc) =>
          doc.data()
        );
        const coleccion2Data = coleccion2Snapshot.docs.map((doc) =>
          doc.data()
        );

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

module.exports = {
  getAppData,
};
