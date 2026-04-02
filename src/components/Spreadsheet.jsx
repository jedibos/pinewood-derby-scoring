import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'pinewood-derby-data-v1'

function buildRacer(id, group, name) {
  return {
    id,
    group,
    name: name || `Car ${id}`,
  }
}

export default function Spreadsheet() {
  const [racers, setRacers] = useState([])
  const [newGroup, setNewGroup] = useState('Tiny Tigers')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState(nextAvailableNumber([]));

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setRacers(parsed.racers || [])
      } catch (e) {
        console.warn('Failed to parse storage', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ racers }))
  }, [racers])

function addRacer() {
  setRacers(prev => {
    const racer = buildRacer(newNumber, newGroup, newName);
    const updated = [...prev, racer];

    setNewNumber(nextAvailableNumber(updated));
    setNewName("");

    return updated;
  });
}

  function nextAvailableNumber(list) {
    const nums = list.map(r => Number(r.id)).filter(n => Number.isFinite(n));
    return nums.length === 0 ? 1 : Math.max(...nums) + 1;
  }

  function removeRacer(id) {
    setRacers(prev => prev.filter(r => r.id !== id))
  }

  function updateRacer(id, patch) {
    setRacers(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }
  
  const groups = Array.from(new Set(racers.map(r => r.group || 'A'))).sort()

  return (
    <div className="sheet">
      <h2>Register</h2>
      <div className="controls">
        <div className="label-grid">
          <span>Group</span>
          <input list="groups" value={newGroup} onChange={e => setNewGroup(e.target.value)} />
          <datalist id="groups">
            {groups.map(g => <option key={g} value={g} />)}
          </datalist>

          <span>Number</span>
          <input className="number-input" value={newNumber} onChange={e => setNewNumber(e.target.value)} />

          <span>Name</span>
          <input className="name-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., John Doe" />
        </div>

        <div className="button-row">
            <button onClick={addRacer}>Add Racer</button>
          </div>
      </div>

      <h2>Racers</h2>
      {groups.map(group => {
        const list = racers.filter(r => r.group === group)
        const display = list
        return (
          <section key={group} className="group-section">
            <h3 className="group-title">{group} <span className="group-count">({list.length})</span></h3>
            {display.map((r, i) => {
                return (
                  <div className="racer-grid" key={r.id}>
                    <input
                      className="number-input"
                      value={r.id}
                      onChange={e => updateRacer(r.id, { number: e.target.value })}
                    />

                    <input
                      className="name-input"
                      value={r.name}
                      onChange={e => updateRacer(r.id, { name: e.target.value })}
                    />

                    <button className="remove-btn" onClick={() => removeRacer(r.id)}>X</button>
                  </div>
                )
            })}
          </section>
        )
      })}

      </div>
    )
  }
