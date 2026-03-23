import { Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage';
import MainLayout from "./layouts/MainLayout";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import AdminRoute from "./components/AdminRoute";
import { TabProvider } from "./context/TabContext";
import AuthPage from "./pages/AuthPage";
import { UserProvider } from "./context/UserContext";
import VerificationSignup from "./pages/VerificationSignup";
import { useAxiosInterceptor } from "./service/useAxiosInterceptor";
import ProductsPage from "./pages/ProductsPage";
import ContactPage from "./pages/ContactPage";
import CartPage from './pages/CartPage';
import { ToastContainer } from "react-toastify";
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from "./pages/OrdersPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  useAxiosInterceptor();
  return (
    <TabProvider>
      <UserProvider>
      <Routes>
        <Route element={<MainLayout></MainLayout>}>
          <Route path='/' element={<HomePage></HomePage>}></Route>
          <Route path="/services" element={<ServicesPage></ServicesPage>}></Route>
          <Route path="/profile" element={<ProfilePage></ProfilePage>}></Route>
          <Route path="/products" element={<ProductsPage></ProductsPage>}></Route>
          <Route path="/contact" element={<ContactPage></ContactPage>}></Route>
          <Route path="/cart" element={<CartPage></CartPage>}></Route>
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}></Route>
          <Route path="/orders" element={<OrdersPage></OrdersPage>}></Route>
        </Route>
        <Route path="/forgotPassword" element={<ForgotPasswordPage></ForgotPasswordPage>}></Route>
        <Route path="/resetPassword" element={<ResetPasswordPage></ResetPasswordPage>}></Route>
        <Route path="/checkout" element={<CheckoutPage></CheckoutPage>}></Route>
        <Route path="/login" element={<AuthPage authMethod="login"></AuthPage>}></Route>
        <Route path="/signup" element={<AuthPage authMethod="signup"></AuthPage>}></Route>
        <Route path="/verificationSignup" element={<VerificationSignup></VerificationSignup>}></Route>
      </Routes>
      <ToastContainer theme="colored" />
      </UserProvider>
    </TabProvider>
  )
}

export default App
