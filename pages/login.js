import React from 'react'
import { signIn } from 'next-auth/react'

const Login = () => {
  return (
    <div>
      <button onClick={async () => await signIn('google')}>Sign in</button>
    </div>
  )
}

export default Login
