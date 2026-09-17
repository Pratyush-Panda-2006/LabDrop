import { app } from './app';

const PORT = process.env.PORT || 3001;
const EXPECTED_PIN = (process.env.APP_PIN || '141106').trim();

app.listen(PORT, () => {
  console.log(`[Vault Server] Running on http://localhost:${PORT}`);
  console.log(`[Vault Server] Expected PIN configured: ${EXPECTED_PIN.replace(/./g, '•')}`);
});
