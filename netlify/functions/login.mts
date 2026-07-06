import { login, verifyRequestOrigin } from "@netlify/identity"

export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 })

  try {
    verifyRequestOrigin(request)
  } catch {
    return Response.json({ error: "Invalid request origin" }, { status: 403 })
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) return Response.json({ error: "Missing credentials" }, { status: 400 })
    await login(email, password)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "Invalid email or password" }, { status: 401 })
  }
}
