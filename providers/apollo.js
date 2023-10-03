import React, { useEffect, useState } from 'react'
import {
  ApolloClient,
  HttpLink,
  split,
  ApolloProvider as Provider,
} from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from '@apollo/client/cache'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import _, { isUndefined } from 'lodash'
import { getCookies, isClient } from '@/utils'

const authLink = setContext(async (_, { headers }) => {
  let nextAuthToken = getCookies()['next-auth.session-token']
  return {
    headers: {
      ...headers,
      ...(nextAuthToken && {
        'mullayan-next-auth-token': nextAuthToken,
      }),
    },
  }
})

function getWsLink({ url }) {
  const wsURL = new URL(url)
  wsURL.protocol = wsURL.protocol === 'https:' ? 'wss:' : 'ws:'
  return isClient
    ? new WebSocketLink({
        uri: wsURL.href,
        options: {
          lazy: true,
          reconnect: true,
          connectionParams: async () => {
            let nextAuthToken = getCookies()['next-auth.session-token']
            return {
              headers: {
                ...(nextAuthToken && {
                  'mullayan-next-auth-token': nextAuthToken,
                }),
              },
            }
          },
        },
      })
    : null
}

function getHTTPLink({ url }) {
  return new HttpLink({
    uri: isClient && url,
  })
}

function getLink({ wsLink, url, isWsRequired = false }) {
  if (isWsRequired) {
    return isClient
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query)
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            )
          },
          wsLink || getWsLink({ url }),
          authLink.concat(getHTTPLink({ url }))
        )
      : getHTTPLink({ url })
  } else {
    return isClient
      ? authLink.concat(getHTTPLink({ url }))
      : getHTTPLink({ url })
  }
}

export function getApolloClient({ url, isWsRequired = false }) {
  if (!url) return
  let wsLink
  if (isWsRequired) {
    wsLink = getWsLink({ url })
  }
  const client = new ApolloClient({
    link: getLink({ wsLink, url, isWsRequired }),
    cache: new InMemoryCache(),
  })

  return { client, wsLink }
}

export const ApolloProvider = ({ children }) => {
  const [{ client, wsLink }, setClient] = useState(
    getApolloClient({
      isWsRequired: true,
      url: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_API,
    })
  )

  const restartWebsocketConnection = (isAuthenticated, _wsLink) => {
    if (
      isAuthenticated !== undefined &&
      client.isAuthenticated === isAuthenticated
    )
      return
    _wsLink.subscriptionClient.close()
    const newClient = getApolloClient({
      url: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_API,
      isWsRequired: true,
    })
    if (!isUndefined(isAuthenticated)) {
      newClient.client.isAuthenticated = isAuthenticated
    } else {
      newClient.client.isAuthenticated = client.isAuthenticated
    }
    setClient(newClient)
  }

  useEffect(() => {
    if (!client || !wsLink) return
    client.restartWebsocketConnection = (isAuthenticated) => {
      restartWebsocketConnection(isAuthenticated, wsLink)
    }
  }, [client, wsLink])

  return <Provider client={client}>{children}</Provider>
}
