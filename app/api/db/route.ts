import { createClient } from "@/utils/supabase/server";
import { encrypt } from "@/lib/helper";
import { NextResponse } from "next/server";
import { liveDbConnectSchema } from "@/types/livedbconnect.types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    const result = liveDbConnectSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { databaseType, connectionString, duration } = result.data;

    const hours = parseInt(duration);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const encryptedString = encrypt(connectionString);

    const { error: dbError, data } = await supabase
      .from("user_db_credentials")
      .insert({
        user_id: user.id,
        db_type: databaseType,
        encrypted_connection_string: encryptedString,
        expires_at: expiresAt.toISOString(),
        nickname: `${databaseType} - ${hours}h Session`,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json(
        { error: `Failed to save credentials. ${dbError}` },
        { status: 500 },
        
      );
    }

    return NextResponse.json({ success: true, dbId: data.id });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
