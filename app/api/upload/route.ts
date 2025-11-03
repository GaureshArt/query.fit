import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import Database from "better-sqlite3";
import csvParser from "csv-parser";
import { Readable } from "stream";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    console.log("file :",file)
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const dbId = randomUUID();
    const finalDbPath = path.join(os.tmpdir(), `queryfit_${dbId}.db`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (file.name.endsWith(".db") || file.name.endsWith(".sqlite")) {
      await fs.writeFile(finalDbPath, fileBuffer);
    } else if (file.name.endsWith(".sql")) {
      const db = new Database(finalDbPath);
      db.exec(fileBuffer.toString("utf8"));
      db.close();
    } else if (file.name.endsWith(".csv")) {
      const db = new Database(finalDbPath);
      const rows: Record<string, string>[] = [];
      const stream = Readable.from(fileBuffer);
      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on("data", (row: Record<string, string>) => {
            rows.push(row);
          })
          .on("end", () => {
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      });

      if (rows.length === 0) {
        db.close();
        return NextResponse.json(
          { error: "CSV file is empty." },
          { status: 400 }
        );
      }
      const headers = Object.keys(rows[0]);
      const columns = headers
        .map((h) => `"${h.replace(/"/g, '""')}" TEXT`)
        .join(", ");
      db.exec(`CREATE TABLE data (${columns})`);
      const placeholders = headers.map(() => "?").join(",");
      const insert = db.prepare(`INSERT INTO data VALUES (${placeholders})`);
      const insertMany = db.transaction((allRows: Record<string, string>[]) => {
        for (const row of allRows) {
          const values = Object.values(row);
          insert.run(values);
        }
      });

      insertMany(rows);
      db.close();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 }
      );
    }
    return NextResponse.json({ dbId: dbId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
