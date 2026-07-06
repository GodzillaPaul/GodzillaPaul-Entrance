import { logout, verifyRequestOrigin } from "@netlify/identity"

export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 })
  try {
    verifyRequestOrigin(request)
    await logout()
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "Unable to log out" }, { status: 403 })
  }
}
