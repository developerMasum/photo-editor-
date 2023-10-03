import { decode } from 'next-auth/jwt'

const authorizeRequest = async (req, res) => {
  const authToken = req.body.headers['solo-editor-next-auth-token']

  if (authToken) {
    try {
      const { role } = await decode({
        token: authToken,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (role) {
        return res.status(200).json({
          'X-Hasura-Role': role,
        })
      }
      return res
        .status(403)
        .json({ success: false, error: 'Unauthorize access' })
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
    }
  } else {
    return res.status(200).json({
      'X-Hasura-Role': 'guest',
    })
  }
}
export default authorizeRequest
