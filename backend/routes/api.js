import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const RAG_SERVICE = process.env.RAG_SERVICE_URL;

// Helper to push updates to n8n
async function triggerAutomation(event, payload) {
  try {
    if (!process.env.N8N_WEBHOOK_URL) return;
    await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data: payload })
    });
  } catch (err) {
    console.error('Automation webhook missed:', err.message);
  }
}

router.post('/task', async (req, res) => {
  const { title, subject, deadline } = req.body;
  if (!title || !subject || !deadline) return res.status(400).json({ error: 'Missing fields' });

  try {
    //const { data, error } = await supabase.from('tasks').insert([{ title, subject, deadline }]).select().single();
    //if (error) throw error;

    const data = { id: 999, title, subject, deadline, status: "Faked DB Save" };
    
    triggerAutomation('TASK_CREATED', data);

    // Send to Python RAG
    fetch(`${RAG_SERVICE}/api/v1/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: 'tasks',
        id: `task_${data.id}`,
        text: `Task: ${title} for ${subject} is due on ${deadline}.`
      })
    }).catch(e => console.error('RAG offline:', e.message));

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/attendance-risk', async (req, res) => {
  const { subject, attendance } = req.body;
  const score = parseFloat(attendance);
  let risk = score < 75 ? (score < 65 ? 'High' : 'Medium') : 'Low';
  let recommendation = score < 75 ? `Attend the next ${Math.ceil((75 - score) * 0.6)} classes to recover.` : 'Healthy attendance.';

  if (risk === 'High') triggerAutomation('ATTENDANCE_ALERT', { subject, attendance: score, recommendation });

  // Send to Python RAG
  fetch(`${RAG_SERVICE}/api/v1/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: 'attendance',
      id: `att_${subject.toLowerCase()}`,
      text: `Attendance for ${subject} is ${score}%. Risk: ${risk}. Advice: ${recommendation}`
    })
  }).catch(e => console.error('RAG offline:', e.message));

  return res.status(200).json({ risk, recommendation });
});

router.post('/deadline-plan', async (req, res) => {
  try {
    const response = await fetch(`${RAG_SERVICE}/api/v1/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ plan: ["Day 1: Read Notes", "Day 2: Core Work", "Day 3: Review"] });
  }
});

router.post('/ask', async (req, res) => {
  try {
    const response = await fetch(`${RAG_SERVICE}/api/v1/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "RAG microservice disconnected." });
  }
});

export default router;