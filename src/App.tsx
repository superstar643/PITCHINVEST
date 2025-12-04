
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Gallery from "./pages/Gallery";
import GalleryDetail from "./pages/GalleryDetail";
import Auction from "./pages/Auction";
import Message from "./pages/Message";
import UserDetail from "./pages/UserDetail";
import Investors from "./pages/Investors";
import InvestorDetail from "./pages/InvestorDetail";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import About from "./pages/About";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes wrapped with AppLayout to include Header/Footer */}
            <Route path="/" element={<Index />} />
            <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
            <Route path="/gallery/:id" element={<AppLayout><GalleryDetail /></AppLayout>} />
            <Route path="/investors" element={<AppLayout><Investors /></AppLayout>} />
            <Route path="/blog" element={<AppLayout><Blog /></AppLayout>} />
            <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
            <Route path="/about" element={<AppLayout><About /></AppLayout>} />
            <Route path="/user/:id" element={<AppLayout><UserDetail /></AppLayout>} />
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
