export const usernamePattern=/^[a-z0-9_]{3,24}$/;
export const passwordHint='At least 12 characters, with uppercase and lowercase letters, a number and a symbol.';
export function validNewPassword(value:string){return value.length>=12&&/[A-Z]/.test(value)&&/[a-z]/.test(value)&&/[0-9]/.test(value)&&/[!@#$%^&*()_+\-=\[\]{};'\":\\|<>?,./`~]/.test(value);}
export function normalizeUsername(value:string){return value.trim().replace(/^@/,'').toLowerCase();}
