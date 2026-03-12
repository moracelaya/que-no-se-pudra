// supabase.js — Credenciales de tu proyecto Supabase
// ⚠️ Este archivo está en .gitignore — no se sube a GitHub

const SUPABASE_URL  = 'https://durcgxqlgrwahwljnzpl.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cmNneHFsZ3J3YWh3bGpuenBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDE2NDksImV4cCI6MjA4ODkxNzY0OX0.5MkfI6xMdUe6JqtAsK9YwbjEAtr2Z6qnqIPrYGJ9GvQ'

const { createClient } = window.supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON)
