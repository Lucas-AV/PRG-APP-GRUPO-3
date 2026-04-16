import promptSync from "prompt-sync";
import { menuUF }     from "./menus/ufMenu";
import { menuCidade } from "./menus/cidadeMenu";
import { menuRegiao } from "./menus/regiaoMenu";

const prompt = promptSync();

function main() {
  let sair = false;
  while (!sair) {
    console.log("1. UFs");
    console.log("2. Cidades");
    console.log("3. Regiões");
    console.log("0. Sair");
    const op = prompt("Opção: ").trim();
    switch (op) {
      case "1": menuUF();     break;
      case "2": menuCidade(); break;
      case "3": menuRegiao(); break;
      case "0": sair = true;  break;
      default:  console.log("Opção inválida\n");
    }
  }
  process.exit(0);
}

main();
