import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import Bookshelf from './pages/Bookshelf';
import Category from './pages/Category';
import Rank from './pages/Rank';
import SearchPage from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category" element={<Category />} />
          <Route path="rank" element={<Rank />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="book/:id" element={<BookDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route 
            path="bookshelf" 
            element={
              <RequireAuth>
                <Bookshelf />
              </RequireAuth>
            } 
          />
        </Route>
        <Route path="read/:id/:chapterId" element={<Reader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
