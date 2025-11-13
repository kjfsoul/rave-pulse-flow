import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NewsPage from './pages/News';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
