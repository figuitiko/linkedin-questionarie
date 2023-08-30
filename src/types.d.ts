export interface User {
  name: string
  email?: string
  image?: string
  account: Account
}
export interface Account {
  userId: string
  email: string
  user: User
}
