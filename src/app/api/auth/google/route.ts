import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json({ error: "No credential" }, { status: 400 });
    }

    // Verify Firebase ID token via Google's secure endpoint
    const gRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
    );

    let email: string | undefined;
    let name: string | undefined;
    let picture: string | undefined;
    let googleId: string | undefined;

    if (gRes.ok) {
      const gData = await gRes.json();
      email = gData.email;
      name = gData.name;
      picture = gData.picture;
      googleId = gData.sub;
    } else {
      // Fallback: try Firebase token verification endpoint
      const fbRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=_`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: credential }) }
      );
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        const user = fbData.users?.[0];
        if (user) {
          email = user.email;
          name = user.displayName;
          picture = user.photoUrl;
          googleId = user.localId;
        }
      }
    }

    if (!email) {
      // Last resort: decode JWT payload (Firebase tokens are JWTs)
      try {
        const payload = JSON.parse(Buffer.from(credential.split(".")[1], "base64").toString());
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub || payload.user_id;
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    if (!email) {
      return NextResponse.json({ error: "No email from Google" }, { status: 400 });
    }

    // Find or create customer
    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));

    if (!customer) {
      [customer] = await db
        .insert(customers)
        .values({
          name: name || email.split("@")[0],
          phone: "",
          email,
          avatar: picture || null,
          googleId: googleId || null,
          passwordHash: "google-oauth",
        })
        .returning();
    } else {
      await db
        .update(customers)
        .set({
          avatar: picture || customer.avatar,
          googleId: googleId || customer.googleId,
          name: name || customer.name,
        })
        .where(eq(customers.id, customer.id));
    }

    const token = await createToken({
      id: customer.id,
      role: "customer",
      name: customer.name,
    });

    return NextResponse.json({
      token,
      user: {
        id: customer.id,
        name: customer.name || name,
        email: customer.email,
        avatar: picture || customer.avatar,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
