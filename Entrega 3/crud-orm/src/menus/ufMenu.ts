import promptSync from "prompt-sync";
import { randomUUID } from "crypto";
import { db } from "../db";
import { uf } from "../db/schema";
import { eq } from "drizzle-orm";

const prompt = promptSync();

// ─── Helpers ────────────────────────────────────────────────────────────────

function listar() {
  const lista = db.select().from(uf).all();
  if (lista.length === 0) {
    console.log("\n Nenhuma UF cadastrada\n");
    return;
  }
  console.log("\n UFs cadastradas: ");
  lista.forEach((u) =>
    console.log(`[${u.sigla}] ${u.nome}  (id: ${u.id})`)
  );
}

function criar() {
  console.log("\n  -- Nova UF --");
  const nome  = prompt("Nome:  ").trim();
  const sigla = prompt("Sigla: ").trim().toUpperCase();
  if (!nome || !sigla) { console.log("Campos obrigatórios.\n"); return; }
  db.insert(uf).values({ id: randomUUID(), nome, sigla }).run();
  console.log(`UF "${sigla}" criada com sucesso.\n`);
}

function atualizar() {
  listar();
  const sigla = prompt("Sigla da UF a editar: ").trim().toUpperCase();
  const registro = db.select().from(uf).where(eq(uf.sigla, sigla)).get();
  if (!registro) { console.log("UF não encontrada\n"); return; }

  console.log(`  Editando: [${registro.sigla}] ${registro.nome}`);
  const novoNome  = prompt(`Novo nome  (enter = manter "${registro.nome}"): `).trim();
  const novaSigla = prompt(`Nova sigla: `).trim().toUpperCase();

  db.update(uf)
    .set({
      nome:  novoNome  || registro.nome,
      sigla: novaSigla || registro.sigla,
    })
    .where(eq(uf.id, registro.id))
    .run();
  console.log("UF atualizada.\n");
}

function deletar() {
  listar();
  const sigla = prompt("Sigla da UF a excluir: ").trim().toUpperCase();
  const registro = db.select().from(uf).where(eq(uf.sigla, sigla)).get();
  if (!registro) { console.log("UF não encontrada\n"); return; }

  const conf = prompt(`Confirmar? (s/n): `).toLowerCase();
  if (conf !== "s") { console.log("Cancelado\n"); return; }
  db.delete(uf).where(eq(uf.id, registro.id)).run();
  console.log("UF excluída\n");
}

// ─── Menu ───────────────────────────────────────────────────────────────────

export function menuUF() {
  let sair = false;
  while (!sair) {
    console.log("  1. Listar");
    console.log("  2. Criar");
    console.log("  3. Atualizar");
    console.log("  4. Deletar");
    console.log("  0. Voltar");
    const op = prompt("  Opção: ").trim();
    switch (op) {
      case "1": listar();    break;
      case "2": criar();     break;
      case "3": atualizar(); break;
      case "4": deletar();   break;
      case "0": sair = true; break;
      default:  console.log("Opção inválida\n");
    }
  }
}
