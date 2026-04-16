import promptSync from "prompt-sync";
import { randomUUID } from "crypto";
import { db } from "../db";
import { cidade, uf } from "../db/schema";
import { eq } from "drizzle-orm";

const prompt = promptSync();

function listar() {
  const lista = db
    .select({
      id:       cidade.id,
      nome:     cidade.nome,
      uf_sigla: uf.sigla,
      uf_nome:  uf.nome,
    })
    .from(cidade)
    .innerJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (lista.length === 0) {
    console.log("\n  Nenhuma cidade cadastrada\n");
    return;
  }
  console.log("\n  Cidades cadastradas: ");
  lista.forEach((c) =>
    console.log(`[${c.uf_sigla}] ${c.nome}  (id: ${c.id})`)
  );
}

function escolherUF(): { id: string; sigla: string } | undefined {
  const ufs = db.select().from(uf).all();
  if (ufs.length === 0) {
    console.log("Cadastre uma UF primeiro\n");
    return undefined;
  }
  console.log("  UFs disponíveis:");
  ufs.forEach((u) => console.log(`    [${u.sigla}] ${u.nome}`));
  const sigla = prompt("Sigla da UF: ").trim().toUpperCase();
  const found  = ufs.find((u) => u.sigla === sigla);
  if (!found) { console.log("UF não encontrada\n"); return undefined; }
  return found;
}

function criar() {
  console.log("\n  Nova Cidade");
  const ufEscolhida = escolherUF();
  if (!ufEscolhida) return;
  const nome = prompt("  Nome da cidade: ").trim();
  if (!nome) { console.log("Nome obrigatório.\n"); return; }
  db.insert(cidade).values({ id: randomUUID(), nome, uf_id: ufEscolhida.id }).run();
  console.log(`Cidade "${nome}" criada em ${ufEscolhida.sigla}.\n`);
}

function atualizar() {
  listar();
  const id = prompt("  ID da cidade a editar: ").trim();
  const registro = db.select().from(cidade).where(eq(cidade.id, id)).get();
  if (!registro) { console.log("Cidade não encontrada\n"); return; }

  const novoNome = prompt(`Novo nome (enter = manter "${registro.nome}"): `).trim();
  console.log("Selecione nova UF:");
  const ufEscolhida = escolherUF();

  db.update(cidade)
    .set({
      nome:  novoNome || registro.nome,
      uf_id: ufEscolhida?.id || registro.uf_id,
    })
    .where(eq(cidade.id, id))
    .run();
  console.log("Cidade atualizada\n");
}

function deletar() {
  listar();
  const id = prompt("ID da cidade a excluir: ").trim();
  const registro = db.select().from(cidade).where(eq(cidade.id, id)).get();
  if (!registro) { console.log("Cidade não encontrada\n"); return; }

  const conf = prompt(`Confirmar? (s/n): `).toLowerCase();
  if (conf !== "s") { return; }
  db.delete(cidade).where(eq(cidade.id, id)).run();
  console.log("Cidade excluida\n");
}

export function menuCidade() {
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
