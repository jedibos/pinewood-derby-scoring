import { Field, Input, Label, Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState } from 'react'
import { useRacers } from '../hooks/useRacers'
import { hasDuplicateNumber, nextAvailableNumber } from '../models/racer'

export default function Register() {
  const {
    racers,
    rowErrors,
    addRacer,
    updateRacer,
    setRacerNumber,
    removeRacer,
  } = useRacers()

  const [newGroup, setNewGroup] = useState('Tiny Tigers')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState(nextAvailableNumber(racers))
  const [numberError, setNumberError] = useState('')
  const [nameError, setNameError] = useState('')
  const [groupQuery, setGroupQuery] = useState('')
  const [rowNameErrors, setRowNameErrors] = useState({})

  const groups = Array.from(new Set(racers.map(r => r.group || 'A'))).sort()
  const filteredGroups = groups.length > 0
    ? groups.filter(g => g.toLowerCase().includes(groupQuery.toLowerCase()))
    : groupQuery === '' ? [newGroup] : []

  function handleAddRacer() {
    if (newName.trim() === '') {
      setNameError('Name is required.')
      return
    }

    const numberToUse = String(newNumber).trim() === '' ? nextAvailableNumber(racers) : newNumber

    if (hasDuplicateNumber(racers, null, numberToUse)) {
      setNumberError('Duplicate number.')
      return
    }

    addRacer({ id: numberToUse, group: newGroup, name: newName })
    setNewNumber(nextAvailableNumber([...racers, { id: numberToUse }]))
    setNewName('')
    setNumberError('')
    setNameError('')
  }

  function handleRowNumberChange(racer, value) {
    updateRacer(racer.uid, { id: value })
  }

  return (
    <div className="sheet">
      <h2>Register</h2>

      <div className="form-fields">
        <Field>
          <Label>Group</Label>
          <Combobox as="div" value={null} onChange={setNewGroup} className="combobox-container">
            <ComboboxInput
              className="group-input"
              displayValue={() => newGroup || ''}
              onChange={e => {
                setGroupQuery(e.target.value)
                setNewGroup(e.target.value)
              }}
            />
            <ComboboxOptions className="combobox-options">
              {filteredGroups.map(g => (
                <ComboboxOption key={g} value={g} className="combobox-option">
                  {g}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </Field>
        <Field>
          <Label>Number</Label>
          <div className="input-group">
            <Input
              className={`number-input ${numberError ? 'error' : ''}`}
              value={newNumber}
              onChange={e => { setNewNumber(e.target.value); setNumberError('') }}
              onBlur={() => {
                if (String(newNumber).trim() === '') {
                  setNewNumber(nextAvailableNumber(racers))
                  setNumberError('')
                } else if (hasDuplicateNumber(racers, null, newNumber)) {
                  setNumberError('Duplicate number.')
                } else {
                  setNumberError('')
                }
              }} />
              {numberError && <span className="field-error">{numberError}</span>}    
          </div>
        </Field>
        
        <Field>
          <Label>Name</Label>
          <div className="input-group">
            <Input
              className={`name-input ${nameError ? 'error' : ''}`}
              value={newName}
              onChange={e => { setNewName(e.target.value); setNameError('') }}
              placeholder="e.g., John Doe"
            />
            {nameError && <div className="field-error">{nameError}</div>}
          </div>
          <button onClick={handleAddRacer}>Add Racer</button>
        </Field>
      </div>

      <h2>Racers</h2>
      {groups.map(group => {
        const list = racers.filter(r => r.group === group)
        return (
          <section key={group} className="group-section">
            <h3 className="group-title">{group} <span className="group-count">({list.length})</span></h3>
            {list.map(r => (
              <div key={r.uid} className="racer-grid">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                    className={`number-input ${rowErrors[r.uid] ? 'error' : ''}`}
                    value={r.id}
                    onChange={e => handleRowNumberChange(r, e.target.value)}
                    onBlur={() => setRacerNumber(r.uid, r.id)}
                  />
                  {rowErrors[r.uid] && <div className="error-message">{rowErrors[r.uid]}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                    className={`name-input ${rowNameErrors[r.uid] ? 'error' : ''}`}
                    value={r.name}
                    onChange={e => {
                      updateRacer(r.uid, { name: e.target.value })
                      setRowNameErrors(prev => ({ ...prev, [r.uid]: '' }))
                    }}
                    onBlur={e => {
                      if (!e.target.value.trim()) {
                        setRowNameErrors(prev => ({ ...prev, [r.uid]: 'Name is required.' }))
                      } else {
                        setRowNameErrors(prev => ({ ...prev, [r.uid]: '' }))
                      }
                    }}
                  />
                  {rowNameErrors[r.uid] && <div className="error-message">{rowNameErrors[r.uid]}</div>}
                </div>

                <button className="remove-btn" onClick={() => removeRacer(r.uid)}>X</button>
              </div>
            ))}
          </section>
        )
      })}

    </div>
  )
}
