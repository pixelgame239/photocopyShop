import { Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage';
import MainLayout from "./layouts/MainLayout";
import ServicesPage from "./pages/ServicesPage";
import { TabProvider } from "./context/TabContext";
import AuthPage from "./pages/AuthPage";
import { UserProvider } from "./context/UserContext";
import VerificationSignup from "./pages/VerificationSignup";
import { useAxiosInterceptor } from "./service/useAxiosInterceptor";

function App() {
  useAxiosInterceptor();
  return (
    <TabProvider>
      <UserProvider>
      <Routes>
        <Route element={<MainLayout></MainLayout>}>
          <Route path='/' element={<HomePage></HomePage>}></Route>
          <Route path="/services" element={<ServicesPage></ServicesPage>}></Route>
        </Route>
        <Route path="/login" element={<AuthPage authMethod="login"></AuthPage>}></Route>
        <Route path="/signup" element={<AuthPage authMethod="signup"></AuthPage>}></Route>
        <Route path="/verificationSignup" element={<VerificationSignup></VerificationSignup>}></Route>
      </Routes>
      </UserProvider>
    </TabProvider>
  )
}

export default App
