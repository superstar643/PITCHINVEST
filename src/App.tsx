import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AuthCallback from "./components/auth/AuthCallback";
import ResetPassword from "./components/auth/ResetPassword";
import Gallery from "./pages/Gallery";
import GalleryDetail from "./pages/GalleryDetail";
import Auction from "./pages/Auction";
import Message from "./pages/Message";
import UserDetail from "./pages/UserDetail";
import Settings from "./pages/Settings";
import Investors from "./pages/Investors";
import InvestorDetail from "./pages/InvestorDetail";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import AdminPricing from "./pages/Admin/Pricing";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminProjects from "./pages/Admin/Projects";
import AdminInvoices from "./pages/Admin/Invoices";
import AdminUsers from "./pages/Admin/Users";
import AdminAnalytics from "./pages/Admin/Analytics";
import AdminProfileApproval from "./pages/Admin/ProfileApproval";
import AdminAdvertising from "./pages/Admin/Advertising";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
        >
          <PageTransitionLoader />
          <Routes>
            {/* Auth Routes - Public Access */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public Routes - Accessible to Everyone */}
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<AppLayout><Blog /></AppLayout>} />
            <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
            <Route path="/about" element={<AppLayout><About /></AppLayout>} />
            <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />

            {/* Subscription Routes - Accessible to authenticated users (needed to complete payment) */}
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

            {/* Protected Routes - Require Active Subscription + Approved Status */}
            <Route path="/gallery" element={
              <ProtectedRoute>
                <AppLayout><Gallery /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/gallery/:id" element={
              <ProtectedRoute>
                <AppLayout><GalleryDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/investors" element={
              <ProtectedRoute>
                <AppLayout><Investors /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/user/:id" element={
              <ProtectedRoute>
                <AppLayout><UserDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/investor/:id" element={
              <ProtectedRoute>
                <AppLayout><InvestorDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/auction/:id" element={
              <ProtectedRoute>
                <AppLayout><Auction /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <AppLayout><Message /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/messages/:id" element={
              <ProtectedRoute>
                <AppLayout><Message /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes - Protected (Admins bypass membership check) */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projects" element={
              <ProtectedRoute>
                <AppLayout><AdminProjects /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/invoices" element={
              <ProtectedRoute>
                <AppLayout><AdminInvoices /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AppLayout><AdminUsers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pricing" element={
              <ProtectedRoute>
                <AppLayout><AdminPricing /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AppLayout><AdminAnalytics /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/profile-approval" element={
              <ProtectedRoute>
                <AppLayout><AdminProfileApproval /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/advertising" element={
              <ProtectedRoute>
                <AppLayout><AdminAdvertising /></AppLayout>
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;