import bcrypt from "bcrypt";

export async function hashPassword(plainPassword: string) {
  const hash = await bcrypt.hash(plainPassword, 12);
  return hash;
}

export async function checkPassword(plainPassword: string, hashedPassword: string) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}