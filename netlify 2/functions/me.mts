import { getUser } from "@netlify/identity"

export default async () => {
  const user = await getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json({ email: user.email, roles: user.roles || [] })
}
