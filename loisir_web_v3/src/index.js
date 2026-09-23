//src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client'; // Importez createRoot
import App from './App';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Importez BrowserRouter
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );

// Sélectionnez l'élément racine
const container = document.getElementById('root');
const root = createRoot(container); // Créez une racine

// Rendu de l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);