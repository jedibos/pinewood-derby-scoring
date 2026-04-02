import { useEffect, useState } from 'react'
import { buildRacer, nextAvailableNumber as nextNumberFn, getDuplicateNumberErrors } from '../models/racer'

const STORAGE_KEY = 'pinewood-derby-data-v1'

export function useRacers() {
  const [racers, setRacers] = useState([])
  const [rowErrors, setRowErrors] = useState({})

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

  function updateRowErrors(updatedRacers) {
    const errors = getDuplicateNumberErrors(updatedRacers)
    setRowErrors(errors)
  }

  function addRacer({ id, group, name }) {
    const numberToUse = String(id).trim() === '' ? nextNumberFn(racers) : id
    const racer = buildRacer(numberToUse, group, name)
    setRacers(prev => {
      const updated = [...prev, racer]
      updateRowErrors(updated)
      return updated
    })
    return racer
  }

  function updateRacer(uid, patch) {
    setRacers(prev => {
      const updated = prev.map(r => (r.uid === uid ? { ...r, ...patch } : r))
      updateRowErrors(updated)
      return updated
    })
  }

  function setRacerNumber(uid, newNumber) {
    setRacers(prev => {
      const updated = prev.map(r => {
        if (r.uid !== uid) return r
        const trimmed = String(newNumber).trim()
        const id = trimmed === '' ? nextNumberFn(prev.filter(x => x.uid !== uid)) : trimmed
        return { ...r, id }
      })
      updateRowErrors(updated)
      return updated
    })
  }

  function removeRacer(uid) {
    setRacers(prev => {
      const updated = prev.filter(r => r.uid !== uid)
      updateRowErrors(updated)
      return updated
    })
  }

  useEffect(() => {
    updateRowErrors(racers)
  }, [racers])

  return {
    racers,
    rowErrors,
    addRacer,
    updateRacer,
    setRacerNumber,
    removeRacer,
    nextAvailableNumber: list => nextNumberFn(list),
  }
}
