import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient
export const thisIsAModule = true
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (global?.prisma === undefined) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
