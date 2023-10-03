import { SessionProvider } from 'next-auth/react'
// import { ApolloProvider } from '@/providers'
// Provider will  be wrapped by  ApolloProvider
import 'antd/dist/reset.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
    
        <Component {...pageProps} />
      
    </SessionProvider>
  )
}
