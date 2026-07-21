import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import PurchasePage from './pages/PurchasePage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyTicketsPage from './pages/MyTicketsPage';
import { CartProvider } from './hooks/useCart';

function App() {
  return (
    <Router>
      <CartProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/purchase/:id" element={<PurchasePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:id" element={<ConfirmationPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
          </Routes>
        </MainLayout>
      </CartProvider>
    </Router>
  );
}

export default App;
