export function validateEmailAmikom(email) {
  return /^[a-zA-Z0-9._%+-]+@student\.amikom\.ac\.id$/.test(email)
}

export function validateNim(nim) {
  // Format contoh: 23.01.1234
  return /^\d{2}\.\d{2}\.\d{4}$/.test(nim)
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6
}