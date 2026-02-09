class Concorrencia {
  constructor() {
    // Fila que armazena as funções pendentes de execução
    // Cada item contém: a função, o resolve e o reject da Promise
    this.queue = [];

    // Flag que indica se a fila já está sendo processada
    // Evita que duas execuções rodem ao mesmo tempo
    this.executando = false;
  }

  // Método público usado pelo controller
  // Recebe uma função assíncrona (ex: service.executar)
  executar(fn) {
    return new Promise((resolve, reject) => {
      // Adiciona a função na fila junto com
      // os callbacks de sucesso e erro da Promise
      this.queue.push({ fn, resolve, reject });

      // Tenta iniciar o processamento da fila
      // Se já estiver rodando, não faz nada
      this.processar();
    });
  }

  // Método interno que processa a fila
  async processar() {
    // Se já estiver executando, sai imediatamente
    // Isso garante que apenas UM loop rode por vez
    if (this.executando) return;

    // Marca que o processamento começou
    this.executando = true;

    // Enquanto houver itens na fila
    while (this.queue.length) {
      // Remove o primeiro item da fila (FIFO)
      const { fn, resolve, reject } = this.queue.shift();

      try {
        // Executa a função passada (ex: service.executar)
        // Aguarda terminar antes de ir para o próximo
        const resultado = await fn();

        // Resolve a Promise associada a essa execução
        resolve(resultado);
      } catch (err) {
        // Caso ocorra erro, rejeita a Promise
        reject(err);
      }
    }

    // Quando a fila estiver vazia, libera a execução
    // Permitindo que novas chamadas iniciem o processamento
    this.executando = false;
  }
}

// Exporta UMA única instância da classe
// O Node.js mantém esse objeto em cache,
// garantindo que todos os requests compartilhem a mesma fila
export default new Concorrencia(); // 👈 instância única
