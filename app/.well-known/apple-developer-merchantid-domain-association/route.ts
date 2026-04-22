import { NextResponse } from "next/server";

export async function GET() {
  const domainAssociation = process.env.APPLE_PAY_DOMAIN_ASSOCIATION;

  if (!domainAssociation) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(domainAssociation, {
    headers: { "Content-Type": "text/plain" },
  });
}
