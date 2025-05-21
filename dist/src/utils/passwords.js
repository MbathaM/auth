import { compare, hash, genSalt } from "bcryptjs";
export async function hashPassword(password) {
    try {
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        throw new Error("Error hashing password");
    }
}
export async function comparePassword(password, hashedPassword) {
    try {
        const isMatch = await compare(password, hashedPassword);
        return isMatch;
    }
    catch (error) {
        throw new Error("Error comparing passwords");
    }
}
