const apolloClient = async () => {
  try {
    return new GraphQLClient(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_API, {
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
      },
    })
  } catch (error) {
    console.error('error', error)
  }
}
export { apolloClient }
