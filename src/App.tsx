
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
import AppLayout from "./components/AppLayout";

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Routes wrapped with AppLayout to include Header/Footer */}
            <Route path="/" element={<Index />} />
            <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
            <Route path="/gallery/:id" element={<AppLayout><GalleryDetail /></AppLayout>} />
            <Route path="/investors" element={<AppLayout><Investors /></AppLayout>} />
            <Route path="/blog" element={<AppLayout><Blog /></AppLayout>} />
            <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
            <Route path="/about" element={<AppLayout><About /></AppLayout>} />
            <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
            <Route path="/user/:id" element={<AppLayout><UserDetail /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/investor/:id" element={<AppLayout><InvestorDetail /></AppLayout>} />
            <Route path="/auction/:id" element={<AppLayout><Auction /></AppLayout>} />
            <Route path="/messages" element={<AppLayout><Message /></AppLayout>} />
            <Route path="/messages/:id" element={<AppLayout><Message /></AppLayout>} />
            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
