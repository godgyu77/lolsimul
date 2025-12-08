import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-1 overflow-hidden min-w-0">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

