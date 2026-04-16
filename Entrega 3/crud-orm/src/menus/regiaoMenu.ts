import promptSync from "prompt-sync";
import { randomUUID } from "crypto";
import { db } from "../db";
import { regiao, cidade, uf } from "../db/schema";
import { eq } from "drizzle-orm";

const prompt = promptSync();

function listar() {
  const lista = db
    .select({
      id:          regiao.id,
      nome:        regiao.nome,
      cidade_nome: cidade.nome,
      uf_sigla:    uf.sigla,
    })
    .from(regiao)
    .innerJoin(cidade, eq(regiao.cidade_id, cidade.id))
    .innerJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (lista.length === 0) {
    console.log("\nNenhuma região cadastrada\n");
    return;
  }
  console.log("\n Regiões cadastradas: ");
  lista.forEach((r) =>
    console.log(`${r.uf_sigla} - ${r.cidade_nome} - ${r.nome}  (id: ${r.id})`)
  );
}

function escolherCidade(): { id: string; nome: string } | undefined {
  const cidades = db
    .select({ id: cidade.id, nome: cidade.nome, sigla: uf.sigla })
    .from(cidade)
    .innerJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (cidades.length === 0) {
    console.log("Cadastre uma cidade primeiro\n");
    return undefined;
  }
  console.log("Cidades disponiveis:");
  cidades.forEach((c) => console.log(`    [${c.sigla}] ${c.nome}  (id: ${c.id})`));
  const id = prompt("  ID da cidade: ").trim();
  const found = cidades.find((c) => c.id === id);
  if (!found) { console.log("Cidade não encontrada.\n"); return undefined; }
  return found;
}

function criar() {
  console.log("\n  Nova Região");
  const cidadeEscolhida = escolherCidade();
  if (!cidadeEscolhida) return;
  const nome = prompt("Nome da região: ").trim();
  if (!nome) { console.log("Nome obrigatório.\n"); return; }
  db.insert(regiao).values({ id: randomUUID(), nome, cidade_id: cidadeEscolhida.id }).run();
  console.log(`Região "${nome}" criada em ${cidadeEscolhida.nome}.\n`);
}

function atualizar() {
  listar();
  const id = prompt("ID da região a editar: ").trim();
  const registro = db.select().from(regiao).where(eq(regiao.id, id)).get();
  if (!registro) { console.log("Região não encontrada.\n"); return; }

  const novoNome = prompt(`Novo nome (enter = manter "${registro.nome}"): `).trim();
  console.log("Selecione nova cidade:");
  const cidadeEscolhida = escolherCidade();

  db.update(regiao)
    .set({
      nome:      novoNome || registro.nome,
      cidade_id: cidadeEscolhida?.id || registro.cidade_id,
    })
    .where(eq(regiao.id, id))
    .run();
  console.log("Região atualizada\n");
}

function deletar() {
  listar();
  const id = prompt("ID da região a excluir: ").trim();
  const registro = db.select().from(regiao).where(eq(regiao.id, id)).get();
  if (!registro) { console.log("Região não encontrada\n"); return; }

  const conf = prompt(`Confirma exclusão de "${registro.nome}"? (s/n): `).toLowerCase();
  if (conf !== "s") { console.log("Cancelado\n"); return; }
  db.delete(regiao).where(eq(regiao.id, id)).run();
  console.log("Região excluída.\n");
}

export function menuRegiao() {
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
