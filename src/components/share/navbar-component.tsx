'use client'

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton
} from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const NavbarComponent = () => {
  const router = useRouter()
  return (
    <>
      <SignedIn>
        {/* Mount the UserButton component */}
        <SignOutButton signOutCallback={() => { router.push('/sign-in') }}>
          <div className='flex cursor-pointer gap-4 p-4'>
            <p className='text-light-2 max-lg:hidden'>Logout</p>
          </div>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        {/* Signed out users get sign in button */}
        <SignInButton />
      </SignedOut>
    </>
  )
}

export default NavbarComponent
