import React from 'react'
import Spreadsheet from './components/Spreadsheet'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Pinewood Derby Scoring</h1>
      </header>
      <main>
        <Spreadsheet />
      </main>
    </div>
  )
}
