import * as readline from "readline";

// Enums

enum CategoriaPeca {
    Motor = "Motor",
    Freio = "Freio",
    Suspensao = "Suspensao",
    Eletrica = "Elétrica",
    Filtro = "Filtro",
    Outro = "Outro",
}

// Interfaces

interface Vendivel {
    preco: number;
    calcularDesconto(pct: number): number;
}

interface Estocavel {
    quantidade: number;
    verificarDisponibilidade(): boolean;
}

interface Exibivel {
    exibir(): void;
}

// Classe

class Peca implements Vendivel, Estocavel, Exibivel {
    readonly codigo: string;
    public nome: string;
    public preco: number;
    public quantidade: number;
    public categoria: CategoriaPeca;

    constructor(
        codigo: string,
        nome: string,
        preco: number,
        quantidade: number,
        categoria: CategoriaPeca
    ) {
        this.codigo = codigo;
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
        this.categoria = categoria;
    }

    calcularDesconto(pct: number): number {
        return this.preco * (1 - pct/100);
    }

    verificarDisponibilidade(): boolean {
        return this.quantidade > 0;
    }

    exibir(): void {
        const disponivel = this.verificarDisponibilidade() 
        ? "Em estoque" 
        : "Sem estoque";

        console.log(`
            ${this.nome} |
            Código: ${this.codigo} 
            Categoria: ${this.categoria} 
            Preço: ${this.preco} 
            Qtd: ${this.quantidade} 
            Status: ${disponivel}  
        `)
    }
}

// Repo

class Repo<T extends Peca> {
    private itens: T[] = [];

    adicionar(item: T): void {
        const existe = this.itens.find((i) => i.codigo === item.codigo);
        if (existe) {
            console.log(`\n Peça já cadastrada`);
            return;
        }

        this.itens.push(item);
        console.log(`\n Peça adicionada`)
    }

    buscarPorCodigo(codigo: string): T | undefined {
        return this.itens.find((i) => i.codigo === codigo);
    }
    
    listarTodos(): T[] {
        return [...this.itens];
    }
    
    filtrarPorCategoria(categoria: CategoriaPeca): T[] {
        return this.itens.filter((i) => i.categoria === categoria);
    }
    
    filtrarDisponíveis(): T[] {
        return this.itens.filter((i) => i.verificarDisponibilidade());
    }
    
    get totalItens(): number {
        return this.itens.length;
    }
}

// Vendas

interface ItemVenda {
    peca: Peca;
    quantidade: number;
    precoUnitario: number;
}

class ServicoDeVendas {
    private repositorio: Repo<Peca>;

    constructor(repositorio: Repo<Peca>) {
        this.repositorio = repositorio;
    }

    vender(codigo: string, quantidade: number, desconto: number = 0): void {
        const peca = this.repositorio.buscarPorCodigo(codigo);

        if (!peca) {
            console.log(`Peça não encontrada`);
            return;
        }

        if (peca.quantidade < quantidade) {
            console.log(`Estoque insuficiente`);
            return;
        }

        const precoFinal = desconto > 0 ? peca.calcularDesconto(desconto) : peca.preco;
        const total = precoFinal * quantidade;

        peca.quantidade -= quantidade;

        console.log(`
            ${peca.nome} vendida com sucesso!
            Total: R$ ${total.toFixed(2)}
            `);
    }
}

// Dados iniciais

function popularEstoque(repo: Repo<Peca>): void {
  repo.adicionar(
    new Peca("FO001", "Filtro de Óleo", 45.9, 30, CategoriaPeca.Filtro)
  );
  repo.adicionar(
    new Peca("PA001", "Pastilha de Freio Dianteira", 89.5, 12, CategoriaPeca.Freio)
  );
  repo.adicionar(
    new Peca("AM001", "Amortecedor", 385.0, 4, CategoriaPeca.Suspensao)
  );
  repo.adicionar(
    new Peca("AL001", "Alternador ", 620.0, 6, CategoriaPeca.Eletrica)
  );
  repo.adicionar(
    new Peca("VR001", "Vela de Ignição", 42.0, 50, CategoriaPeca.Motor)
  );
  repo.adicionar(
    new Peca("CO001", "Correia Dentada", 78.0, 0, CategoriaPeca.Motor)
  );
}

// Interface do usuário

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
 
const perguntar = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));
 
const repo = new Repo<Peca>();
const servico = new ServicoDeVendas(repo);
 
popularEstoque(repo);

function exibirMenu(): void {
    console.log(`
        1. Listar peças
        2. Buscar peça por código
        3. Listar peças disponíveis
        4. Registrar venda
        5. Cadastrar peça
        0. Sair
        `);
}

async function cadastrarPeca(): Promise<void> {
    const codigo = await perguntar("Código: ");
    const nome = await perguntar("Nome: ");
    const preco = parseFloat(await perguntar("Preço: R$ "));
    const quantidade = parseInt(await perguntar("Quantidade: "));

    console.log(`
        1. Motor
        2. Freio
        3. Suspensao
        4. Elétrica
        5. Filtro
        6. Outro
    `);

    const catOp = await perguntar("Categoria: ");
    const categorias: Record<string, CategoriaPeca> = {
        "1": CategoriaPeca.Motor,
        "2": CategoriaPeca.Freio,
        "3": CategoriaPeca.Suspensao,
        "4": CategoriaPeca.Eletrica,
        "5": CategoriaPeca.Filtro,
        "6": CategoriaPeca.Outro,
    };

    const categoria = categorias[catOp];

    if (!categoria || isNaN(preco) || isNaN(quantidade)) {
        console.log("Dados inválidos.");
        return;
    }

    repo.adicionar(new Peca(codigo, nome, preco, quantidade, categoria));
}

async function registrarVenda(): Promise<void> {
    const codigo = await perguntar("Código da peça: ");
    const quantidade = parseInt(await perguntar("Quantidade: "));
    const descontoInput = await perguntar("Desconto (%) ou Enter para 0: ");
    const desconto = descontoInput.trim() === "" ? 0 : parseFloat(descontoInput);

    if (isNaN(quantidade) || quantidade <= 0) {
        console.log("Quantidade inválida.");
        return;
    }

    servico.vender(codigo, quantidade, desconto);
}

async function main(): Promise<void> {
    console.log(`\nBem-vindo ao Sistema de Auto Peças!`);
    console.log(`${repo.totalItens} peças carregadas.\n`);

    let rodando = true;

    while (rodando) {
        exibirMenu();
        const opcao = await perguntar("Escolha uma opção: ");

        switch (opcao.trim()) {
            case "1": {
                const todas = repo.listarTodos();
                if (todas.length === 0) {
                    console.log("Nenhuma peça cadastrada.");
                } else {
                    todas.forEach((p) => p.exibir());
                }
                break;
            }

            case "2": {
                const cod = await perguntar("Código: ");
                const encontrada = repo.buscarPorCodigo(cod.trim());
                if (encontrada) {
                    encontrada.exibir();
                } else {
                    console.log("Peça não encontrada.");
                }
                break;
            }

            case "3": {
                const disponiveis = repo.filtrarDisponíveis();
                console.log(`\n${disponiveis.length} peça(s) disponível(is):`);
                disponiveis.forEach((p) => p.exibir());
                break;
            }

            case "4":
                await registrarVenda();
                break;

            case "5":
                await cadastrarPeca();
                break;

            case "0":
                rodando = false;
                console.log("\n");
                break;

            default:
                console.log("Opção inválida.");
        }
    }

    rl.close();
}

main().catch(console.error);