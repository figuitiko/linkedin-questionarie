import { type Account, type User } from '@prisma/client'
import prisma from './prisma'

export const createAccount = async (account: Account) => {
  const { email } = account
  try {
    const createdAccount = await prisma.account.upsert({
      where: { email },
      update: { email },
      create: { email }
    })
    return createdAccount
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const updateUser = async (user: Pick<User, 'email' | 'accountId' | 'name' | 'image'>) => {
  const { email, name, image, accountId } = user
  const data = {
    email,
    accountId,
    ...(name !== undefined && { name }),
    ...(image !== undefined && { image })
  }
  try {
    const updatedUser = await prisma.user.upsert({
      where: { email },
      update: { ...data },
      create: { ...data }
    })
    return updatedUser
  } catch (error) {
    console.error(error)
    throw error
  }
}
export const testAction = async (obj: any) => {
  console.log(obj)
}
