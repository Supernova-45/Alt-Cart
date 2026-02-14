import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/Shell'
import { Home } from './routes/Home'
import { Open } from './routes/Open'
import { Passport } from './routes/Passport'
import { SearchReader } from './routes/SearchReader'
import { Unsupported } from './routes/Unsupported'
import { NotFound } from './routes/NotFound'

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/open" element={<Open />} />
        <Route path="/p/:id" element={<Passport />} />
        <Route path="/s/:id" element={<SearchReader />} />
        <Route path="/unsupported" element={<Unsupported />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  )
}

export default App
