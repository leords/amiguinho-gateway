

// src/integracao/googleScript.js

/**
 * Envia pedidos para Google Sheets via Apps Script
 */
async function enviarParaGoogleScript(pedidos) {
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('❌ URL do Google Script não configurada no .env');
  }

  console.log('═══════════════════════════════════════');
  console.log(`📤 Enviando ${pedidos.length} pedidos para Google Sheets`);
  console.log(`🔗 URL: ${GOOGLE_SCRIPT_URL}`);
  console.log(`📦 Payload:`, JSON.stringify({ pedidos }, null, 2));
  console.log('═══════════════════════════════════════');

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

    console.log(`📡 Status HTTP: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    // Pega o corpo da resposta SEMPRE
    const responseText = await response.text();
    console.log(`📄 Resposta completa (${responseText.length} chars):`, responseText);

    // Se não é 2xx, mostra erro detalhado
    if (!response.ok) {
      console.error('❌ Google Script retornou erro!');
      console.error('   Status:', response.status);
      console.error('   StatusText:', response.statusText);
      console.error('   Body:', responseText);
      
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
    console.error('═══════════════════════════════════════');
    console.error('❌ ERRO DETALHADO:');
    console.error('   Nome:', error.name);
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    console.error('═══════════════════════════════════════');
    
    throw error;
  }
}

export { enviarParaGoogleScript };