import { NextResponse } from "next/server";

import {
  buildOrdersCsv,
  buildSalesCsv,
  buildUsersCsv,
} from "@/lib/admin/analytics";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminUser } from "@/lib/auth/admin";

const EXPORT_KINDS = {
  users: {
    filename: "users.csv",
    build: buildUsersCsv,
  },
  orders: {
    filename: "orders.csv",
    build: buildOrdersCsv,
  },
  sales: {
    filename: "sales.csv",
    build: buildSalesCsv,
  },
} as const;

type ExportKind = keyof typeof EXPORT_KINDS;

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const user = await getCurrentUser();

  if (!user || !(await isAdminUser(user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { kind } = await context.params;
  const exportKind = kind as ExportKind;
  const config = EXPORT_KINDS[exportKind];

  if (!config) {
    return NextResponse.json({ error: "Неизвестный тип отчёта" }, { status: 404 });
  }

  try {
    const csv = await config.build();

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${config.filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Не удалось сформировать отчёт",
      },
      { status: 500 },
    );
  }
}
