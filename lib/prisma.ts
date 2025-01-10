import { PrismaClient } from '@prisma/client';

// Create a new instance of PrismaClient
const prisma = global.prisma || new PrismaClient();

// Assign the instance to global variable in development mode
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
