

// Enviando pedidos para o sheets
async function enviarParaGoogleScript(pedidos) {
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('❌ URL do Google Script não configurada no .env');
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pedidos: pedidos
      }),
      redirect: 'follow' // Importante para Google Script
    });

    // Pega o corpo da resposta SEMPRE
    const responseText = await response.text();
    console.log(`📄 Resposta completa (${responseText.length} chars):`, responseText);

    // Se não é 2xx, mostra erro detalhado
    if (!response.ok) {
      throw new Error(
        `Google Script retornou ${response.status}: ${responseText.substring(0, 200)}`
      );
    }

    // Tenta fazer parse do JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Resposta parseada:', data);
    } catch (parseError) {
      console.warn('⚠️ Resposta não é JSON, mas status foi OK');
      data = { success: true, rawResponse: responseText };
    }

    console.log('✅ Pedidos enviados com sucesso!');
    return data;

  } catch (error) { 
    throw error;
  }
}

export { enviarParaGoogleScript };