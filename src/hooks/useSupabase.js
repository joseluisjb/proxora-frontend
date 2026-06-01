import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export function useSupabase(table) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: err } = await supabase.from(table).select('*')
        if (err) throw err
        setData(result || [])
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [table])

  return { data, loading, error }
}

export async function insertRecord(table, record) {
  const { data, error } = await supabase.from(table).insert([record]).select()
  if (error) throw new Error(error.message)
  return data
}

export async function updateRecord(table, id, updates) {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteRecord(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
}
