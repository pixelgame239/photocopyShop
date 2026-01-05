import { Route, Routes,  BrowserRouter as Router } from "react-router-dom";
import HomePage from './pages/HomePage';
import MainLayout from "./layouts/MainLayout";
import { useState } from "react";
import ServicesPage from "./pages/ServicesPage";
import { TabProvider } from "./context/TabContext";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <TabProvider>
    <Router>
      <Routes>
        <Route element={<MainLayout></MainLayout>}>
          <Route path='/' element={<HomePage></HomePage>}></Route>
          <Route path="/services" element={<ServicesPage></ServicesPage>}></Route>
        </Route>
        <Route path="/login" element={<AuthPage authMethod="login"></AuthPage>}></Route>
        <Route path="/signup" element={<AuthPage authMethod="signup"></AuthPage>}></Route>
      </Routes>
    </Router>
    </TabProvider>
  )
}

export default App
