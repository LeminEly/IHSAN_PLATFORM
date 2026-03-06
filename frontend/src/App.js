// src/App.js
import React from "react";

// Import des composants validator depuis src/components/validator
import Dashboard from "./components/Validator/Dashboard";
import CreateNeed from "./components/Validator/CreateNeed";
import ConfirmDelivery from "./components/Validator/ConfirmDelivery";
import MyNeeds from "./components/Validator/MyNeeds";

function App() {
  return (
    <div className="App">
      <h1>IHSAN Platform - Validator</h1>

      {/* Pour tester le Dashboard */}
      <Dashboard />

      {/* Si tu veux tester d'autres pages, tu peux les décommenter */}
      {/* <CreateNeed /> */}
      {/* <ConfirmDelivery /> */}
      {/* <MyNeeds /> */}
    </div>
  );
}

export default App;