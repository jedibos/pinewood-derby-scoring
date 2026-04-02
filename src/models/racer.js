export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function buildRacer(id, group, name) {
  return {
    uid: generateId(),
    id,
    group,
    name: name || `Car ${id}`,
  }
}

export function nextAvailableNumber(racers) {
  const nums = racers
    .map(r => Number(r.id))
    .filter(n => Number.isFinite(n))
  return nums.length === 0 ? 1 : Math.max(...nums) + 1
}

export function normalizeNumberValue(value) {
  return String(value).trim()
}

export function hasDuplicateNumber(racers, currentUid, number) {
  const normalized = normalizeNumberValue(number)
  if (normalized === '') return false
  return racers.some(r => r.uid !== currentUid && String(r.id).trim() === normalized)
}

export function getDuplicateNumberErrors(racers) {
  const frequency = racers.reduce((acc, r) => {
    const n = String(r.id).trim()
    if (!n) return acc
    acc[n] = (acc[n] || []).concat(r.uid)
    return acc
  }, {})

  return racers.reduce((errors, r) => {
    const id = String(r.id).trim()
    if (id && frequency[id] && frequency[id].length > 1) {
      errors[r.uid] = 'Duplicate number.'
    }
    return errors
  }, {})
}
