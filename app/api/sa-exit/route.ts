import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/super-admin/negocios", request.url));
  response.cookies.delete("barberlab_sa_imp");
  return response;
}
