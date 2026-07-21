import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
// @ts-ignore - JSON bundled at build time
import wpData from "./wp-products.json";

type P = {
  slug: string;
  name: string;
  price: string;
  old_price: string | null;
  category_slug: string | null;
  main_image: string;
  gallery: string[];
  description: string;
  price_value: number | null;
};

type Mode = "upsert" | "destructive";

async function getUserEmail(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.email ?? null;
}

export const runWpImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { mode: Mode; confirm?: string }) => {
    if (input.mode !== "upsert" && input.mode !== "destructive") {
      throw new Error("Modo inválido");
    }
    if (input.mode === "destructive" && input.confirm !== "APAGAR") {
      throw new Error("Confirmação inválida. Digite APAGAR para modo destrutivo.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { mode } = data;
    const { products } = wpData as { products: P[] };
    const userEmail = await getUserEmail(supabase, userId);

    // Load categories
    const { data: cats, error: cErr } = await supabase.from("categories").select("id,slug");
    if (cErr) throw new Error("cats: " + cErr.message);
    const slugToId = new Map((cats ?? []).map((c: any) => [c.slug, c.id as string]));

    const rows = products.map((p, i) => ({
      slug: p.slug,
      name: p.name,
      price: p.price ?? "",
      old_price: p.old_price ?? null,
      category_id: p.category_slug ? slugToId.get(p.category_slug) ?? null : null,
      main_image: p.main_image ?? "",
      gallery: p.gallery ?? [],
      description: p.description ?? "",
      price_value: p.price_value ?? null,
      active: true,
      sort_order: i,
    }));

    let snapshotId: string | null = null;
    let created = 0;
    let updated = 0;
    let removed = 0;

    try {
      // Fetch existing products (needed for created vs updated counting and snapshot)
      const { data: existing, error: eErr } = await supabase.from("products").select("*");
      if (eErr) throw new Error("fetch existing: " + eErr.message);
      const existingBySlug = new Map((existing ?? []).map((p: any) => [p.slug, p]));

      if (mode === "destructive") {
        // Snapshot ALL existing products before wiping
        if ((existing ?? []).length > 0) {
          snapshotId = crypto.randomUUID();
          const backupRows = (existing ?? []).map((p: any) => ({
            snapshot_id: snapshotId,
            product_id: p.id,
            data: p,
            created_by: userId,
            reason: "pre-destructive-import",
          }));
          const BATCH = 50;
          for (let i = 0; i < backupRows.length; i += BATCH) {
            const { error } = await supabase.from("products_backup").insert(backupRows.slice(i, i + BATCH) as any);
            if (error) throw new Error("snapshot: " + error.message);
          }
        }

        const { error: dErr } = await supabase
          .from("products")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        if (dErr) throw new Error("delete: " + dErr.message);
        removed = existing?.length ?? 0;

        const BATCH = 40;
        for (let i = 0; i < rows.length; i += BATCH) {
          const chunk = rows.slice(i, i + BATCH);
          const { error } = await supabase.from("products").insert(chunk);
          if (error) throw new Error(`insert@${i}: ${error.message}`);
        }
        created = rows.length;
      } else {
        // Upsert por slug — não apaga
        for (const row of rows) {
          if (existingBySlug.has(row.slug)) updated++;
          else created++;
        }
        const BATCH = 40;
        for (let i = 0; i < rows.length; i += BATCH) {
          const chunk = rows.slice(i, i + BATCH);
          const { error } = await supabase.from("products").upsert(chunk, { onConflict: "slug" });
          if (error) throw new Error(`upsert@${i}: ${error.message}`);
        }
      }

      // update product_count per category
      for (const [, id] of slugToId) {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", id);
        await supabase.from("categories").update({ product_count: count ?? 0 }).eq("id", id);
      }

      await supabase.from("import_log").insert({
        mode,
        source: "wp-xml",
        created_count: created,
        updated_count: updated,
        removed_count: removed,
        snapshot_id: snapshotId,
        status: "success",
        user_id: userId,
        user_email: userEmail,
      });

      return { ok: true, mode, created, updated, removed, snapshotId, categories: slugToId.size };
    } catch (err: any) {
      await supabase.from("import_log").insert({
        mode,
        source: "wp-xml",
        created_count: created,
        updated_count: updated,
        removed_count: removed,
        snapshot_id: snapshotId,
        status: "error",
        error: String(err?.message ?? err),
        user_id: userId,
        user_email: userEmail,
      });
      throw err;
    }
  });

export const listImportLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("import_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listSnapshots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products_backup")
      .select("snapshot_id, created_at, created_by, reason")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    // group by snapshot_id, keeping earliest created_at + count
    const map = new Map<string, { snapshot_id: string; created_at: string; count: number; reason: string | null }>();
    for (const r of data ?? []) {
      const cur = map.get(r.snapshot_id);
      if (cur) cur.count++;
      else map.set(r.snapshot_id, { snapshot_id: r.snapshot_id, created_at: r.created_at, count: 1, reason: r.reason });
    }
    return Array.from(map.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  });

export const restoreSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { snapshotId?: string; confirm: string }) => {
    if (input.confirm !== "APAGAR") throw new Error("Digite APAGAR para restaurar.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const userEmail = await getUserEmail(supabase, userId);

    // Determine snapshot
    let snapshotId = data.snapshotId;
    if (!snapshotId) {
      const { data: latest, error } = await supabase
        .from("products_backup")
        .select("snapshot_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!latest) throw new Error("Nenhum snapshot disponível.");
      snapshotId = latest.snapshot_id;
    }

    const { data: backup, error: bErr } = await supabase
      .from("products_backup")
      .select("data")
      .eq("snapshot_id", snapshotId);
    if (bErr) throw new Error("backup: " + bErr.message);
    if (!backup || backup.length === 0) throw new Error("Snapshot vazio.");

    // Snapshot current state before restoring
    const { data: existing } = await supabase.from("products").select("*");
    let newSnapshotId: string | null = null;
    if ((existing ?? []).length > 0) {
      newSnapshotId = crypto.randomUUID();
      const backupRows = (existing ?? []).map((p: any) => ({
        snapshot_id: newSnapshotId,
        product_id: p.id,
        data: p,
        created_by: userId,
        reason: "pre-restore",
      }));
      const BATCH = 50;
      for (let i = 0; i < backupRows.length; i += BATCH) {
        const { error } = await supabase.from("products_backup").insert(backupRows.slice(i, i + BATCH));
        if (error) throw new Error("pre-restore snapshot: " + error.message);
      }
    }
    const removed = existing?.length ?? 0;

    // Wipe and restore
    const { error: dErr } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (dErr) throw new Error("wipe: " + dErr.message);

    const rows = backup.map((b: any) => b.data);
    const BATCH = 40;
    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH);
      const { error } = await supabase.from("products").insert(chunk);
      if (error) throw new Error(`restore@${i}: ${error.message}`);
    }

    await supabase.from("import_log").insert({
      mode: "destructive",
      source: `restore:${snapshotId}`,
      created_count: rows.length,
      updated_count: 0,
      removed_count: removed,
      snapshot_id: newSnapshotId,
      status: "success",
      user_id: userId,
      user_email: userEmail,
    });

    return { ok: true, restored: rows.length, removed, snapshotId, preRestoreSnapshotId: newSnapshotId };
  });
