import bcrypt from "bcryptjs"

const hash = await bcrypt.hash("ChangeMe123!", 10)
console.log(hash)