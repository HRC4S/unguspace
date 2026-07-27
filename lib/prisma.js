import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../app/generated/prisma/client'

const globalForPrisma = globalThis

function getAdapter() {
  if (!globalForPrisma.prismaAdapter) {
    globalForPrisma.prismaAdapter = new PrismaMariaDb({
      host: process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.MYSQLPORT) || 3306,
      connectionLimit: 10,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'unguspace',
    })
  }
  return globalForPrisma.prismaAdapter
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter: getAdapter() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma