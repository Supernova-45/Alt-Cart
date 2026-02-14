import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/Shell'
import { Home } from './routes/Home'
import { Passport } from './routes/Passport'
import { PassportFromUrl } from './routes/PassportFromUrl'
import { NotFound } from './routes/NotFound'

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/passport" element={<PassportFromUrl />} />
        <Route path="/passport/:id" element={<Passport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  )
}

export default App
