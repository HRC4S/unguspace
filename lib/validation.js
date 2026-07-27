export function validateEmailAmikom(email) {
  return /^[a-zA-Z0-9._%+-]+@student\.amikom\.ac\.id$/.test(email)
}

export function validateNim(nim) {
  return /^\d{2}\.\d{2}\.\d{4}$/.test(nim)
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6
}

export function validateUsername(username) {
  // huruf kecil, angka, underscore, 3-20 karakter, tanpa spasi
  return /^[a-z0-9_]{3,20}$/.test(username)
}