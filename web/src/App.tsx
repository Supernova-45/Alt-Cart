import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/Shell'
import { Landing } from './routes/Landing'
import { Home } from './routes/Home'
import { Open } from './routes/Open'
import { Extract } from './routes/Extract'
import { ExtractSearch } from './routes/ExtractSearch'
import { Passport } from './routes/Passport'
import { Compare } from './routes/Compare'
import { Preferences } from './routes/Preferences'
import { SearchReader } from './routes/SearchReader'
import { Unsupported } from './routes/Unsupported'
import { NotFound } from './routes/NotFound'

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Home />} />
        <Route path="/open" element={<Open />} />
        <Route path="/extract" element={<Extract />} />
        <Route path="/extract-search" element={<ExtractSearch />} />
        <Route path="/p/:id" element={<Passport />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/s/:id" element={<SearchReader />} />
        <Route path="/unsupported" element={<Unsupported />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  )
}

export default App
