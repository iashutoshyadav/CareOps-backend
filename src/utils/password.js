import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
    return bcrypt.hash(password, 8);
};

const verifyPassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

export {
    hashPassword,
    verifyPassword,
};

export default {
    hashPassword,
    verifyPassword,
};

