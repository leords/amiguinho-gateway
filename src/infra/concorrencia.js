class Concorrencia {
  constructor() {
    // Fila que armazena as funções pendentes de execução
    // Cada item contém: a função, o resolve e o reject da Promise
    this.fila = [];

    // Flag que indica se a fila já está sendo processada
    // Evita que duas execuções rodem ao mesmo tempo
    this.executando = false;
  }

  // Recebe uma função assíncrona (ex: service.executar)
  executar(fn) {
    return new Promise((resolve, reject) => {
      // Adiciona a função na fila junto com
      // os callbacks de sucesso e erro da Promise
      this.fila.push({ fn, resolve, reject });

      // Tenta iniciar o processamento da fila
      // Se já estiver rodando, não faz nada
      this.processar();
    });
  }


  async processar() {
    // Se já estiver executando, sai imediatamente garantindo um por vez.
    if (this.executando) return;

    // Marca que o processamento começou
    this.executando = true;

    // Enquanto houver itens na fila
    while (this.fila.length) {
      // Neste caso ele desestrutura, pega o primeiro item da lista e depois deleta o primeiro item da lista
      const { fn, resolve, reject } = this.fila.shift();

      try {
        const resultado = await fn();

        // Resolve a Promise associada a essa execução
        resolve(resultado);
      } catch (err) {
        // Caso ocorra erro, rejeita a Promise
        reject(err);
      }
    }

    // Quando a fila estiver vazia, libera a execução
    this.executando = false;
  }
}

// Exporta UMA única instância da classe
// O Node.js mantém esse objeto em cache,
// garantindo que todos os requests compartilhem a mesma fila
export default new Concorrencia(); // 👈 instância única
