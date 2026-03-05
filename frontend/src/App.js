import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Public
import Home from './components/Public/Home';
import TransactionDetail from './components/Public/TransactionDetail';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyPhone from './components/Auth/VerifyPhone';

// Donor
import DonorCatalog from './components/Donor/Catalog';
import DonorNeedDetail from './components/Donor/NeedDetail';
import DonorFund from './components/Donor/Fund';
import DonorDonations from './components/Donor/Donations';
import DonorReceipt from './components/Donor/Receipt';

// Validator
import ValidatorDashboard from './components/Validator/Dashboard';
import ValidatorCreateNeed from './components/Validator/CreateNeed';
import ValidatorMyNeeds from './components/Validator/MyNeeds';
import ValidatorConfirmDelivery from './components/Validator/ConfirmDelivery';
import ValidatorRegisterBeneficiary from './components/Validator/RegisterBeneficiary';

// Partner
import PartnerOrders from './components/Partner/Orders';
import PartnerOrderDetail from './components/Partner/OrderDetail';
import PartnerStats from './components/Partner/Stats';

// Admin
import AdminDashboard from './components/Admin/Dashboard';
import AdminPendingValidators from './components/Admin/PendingValidators';
import AdminPendingPartners from './components/Admin/PendingPartners';
import AdminUsers from './components/Admin/Users';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/transaction/:id" element={<TransactionDetail />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-phone" element={<VerifyPhone />} />

              {/* Donor Routes */}
              <Route path="/donor" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorCatalog />
                </ProtectedRoute>
              } />
              <Route path="/donor/need/:id" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorNeedDetail />
                </ProtectedRoute>
              } />
              <Route path="/donor/fund/:id" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorFund />
                </ProtectedRoute>
              } />
              <Route path="/donor/donations" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDonations />
                </ProtectedRoute>
              } />
              <Route path="/donor/receipt/:id" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorReceipt />
                </ProtectedRoute>
              } />

              {/* Validator Routes */}
              <Route path="/validator" element={
                <ProtectedRoute allowedRoles={['validator']}>
                  <ValidatorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/validator/create-need" element={
                <ProtectedRoute allowedRoles={['validator']}>
                  <ValidatorCreateNeed />
                </ProtectedRoute>
              } />
              <Route path="/validator/my-needs" element={
                <ProtectedRoute allowedRoles={['validator']}>
                  <ValidatorMyNeeds />
                </ProtectedRoute>
              } />
              <Route path="/validator/confirm" element={
                <ProtectedRoute allowedRoles={['validator']}>
                  <ValidatorConfirmDelivery />
                </ProtectedRoute>
              } />
              <Route path="/validator/register-beneficiary" element={
                <ProtectedRoute allowedRoles={['validator']}>
                  <ValidatorRegisterBeneficiary />
                </ProtectedRoute>
              } />

              {/* Partner Routes */}
              <Route path="/partner" element={
                <ProtectedRoute allowedRoles={['partner']}>
                  <PartnerOrders />
                </ProtectedRoute>
              } />
              <Route path="/partner/order/:id" element={
                <ProtectedRoute allowedRoles={['partner']}>
                  <PartnerOrderDetail />
                </ProtectedRoute>
              } />
              <Route path="/partner/stats" element={
                <ProtectedRoute allowedRoles={['partner']}>
                  <PartnerStats />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/validators" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPendingValidators />
                </ProtectedRoute>
              } />
              <Route path="/admin/partners" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPendingPartners />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;