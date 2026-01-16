# LinkedLiker 2.0 🚀

LinkedLiker é uma extensão avançada para o Google Chrome que permite curtir automaticamente posts no LinkedIn com controles inteligentes, anti-detecção e estatísticas em tempo real.

## ✨ Novidades da Versão 2.0

### 🛡️ Anti-Detecção
- **Intervalos aleatórios**: Delays variáveis entre 3-8s (configurável)
- **Comportamento humano**: Pequenos delays aleatórios entre cliques
- **Limite diário**: Máximo de 200 curtidas/dia (configurável)
- **Reset automático**: Contador zerado à meia-noite

### ⚙️ Configurações Personalizáveis
- Delay mínimo e máximo entre ciclos
- Número de likes por ciclo
- Limite diário de curtidas
- Velocidade de rolagem
- Ativar/desativar delays aleatórios

### 📊 Estatísticas em Tempo Real
- Contador de curtidas da sessão
- Curtidas do dia vs limite diário
- Tempo de sessão ativo
- Curtidas por hora

### 🎮 Controles Avançados
- Botão Ligar/Desligar
- Botão Pausar/Retomar (sem resetar progresso)
- Painel de configurações completo
- Interface moderna e intuitiva

### 🌍 Suporte Multi-Idioma
- Português, Inglês, Espanhol, Francês, Alemão
- Detecta automaticamente o botão "Ver novas publicações"

### ⚡ Performance Otimizada
- MutationObserver para detectar novos posts
- Limpeza automática de memória
- Código otimizado e sem duplicações

## 🎯 Funcionalidades

- **Interface moderna**: Design inspirado no LinkedIn com gradiente azul
- **Pop-up inteligente**: Estatísticas e controles em tempo real
- **Sistema robusto**: Tratamento de erros e recuperação automática
- **Like automático**: Curte posts visíveis no feed automaticamente
- **Rolagem inteligente**: Carrega mais conteúdo conforme necessário
- **Seguro**: Respeita limites e simula comportamento humano

## 📥 Como Usar

### Instalação:

1. Baixe os arquivos da extensão ou clone o repositório
2. No Chrome, acesse `chrome://extensions/`
3. Ative o **Modo Desenvolvedor** no canto superior direito
4. Clique em **Carregar sem compactação** e selecione a pasta da extensão

### Uso:

1. Acesse o LinkedIn ([https://www.linkedin.com](https://www.linkedin.com))
2. Clique no ícone da extensão na barra de ferramentas
3. Configure as preferências (opcional) clicando em ⚙️ Configurações
4. Clique em **Ligar** para iniciar o auto-liker
5. Use **Pausar** para pausar temporariamente sem perder o progresso
6. Acompanhe as estatísticas em tempo real no popup

## ⚙️ Configurações Disponíveis

| Configuração | Padrão | Descrição |
|-------------|--------|-----------|
| Delay Mínimo | 3000ms | Tempo mínimo entre ciclos |
| Delay Máximo | 8000ms | Tempo máximo entre ciclos |
| Likes por Ciclo | 30 | Máximo de curtidas por execução |
| Limite Diário | 200 | Máximo de curtidas por dia |
| Velocidade de Rolagem | 1500px | Pixels rolados por vez |
| Delays Aleatórios | ✅ Ativado | Anti-detecção habilitado |

## 📁 Estrutura do Projeto

```
LinkedLiker/
├── manifest.json          # Configuração da extensão
├── popup.html            # Interface do popup
├── popup.js              # Lógica da interface
├── style.css             # Estilos modernos
├── content.js            # Script de automação
├── background.js         # Service worker
├── icon16.svg            # Ícone 16x16
├── icon48.svg            # Ícone 48x48
├── icon128.svg           # Ícone 128x128
└── readme.md             # Este arquivo
```

## 🔒 Segurança e Limites

A extensão implementa várias medidas de segurança:

- **Limite diário**: Evita uso excessivo (200 curtidas/dia)
- **Intervalos aleatórios**: Simula comportamento humano
- **Delays variáveis**: Previne detecção de padrões
- **Tratamento de erros**: Para automaticamente após 3 erros consecutivos
- **Reset automático**: Limpa estado ao fechar/reabrir o LinkedIn

⚠️ **Aviso**: Use com moderação. O LinkedIn pode detectar e bloquear atividades automatizadas se usadas em excesso.

## 🚀 Melhorias Implementadas

### Versão 2.0.0
- ✅ Sistema de anti-detecção com delays aleatórios
- ✅ Painel de configurações completo
- ✅ Estatísticas em tempo real (sessão, diário, tempo, velocidade)
- ✅ Botões Pausar/Retomar
- ✅ Suporte multi-idioma (5 idiomas)
- ✅ MutationObserver para performance
- ✅ Limpeza automática de memória
- ✅ Código otimizado sem duplicações
- ✅ Manifest V3 completo com host_permissions
- ✅ Reset automático diário

## 🛠️ Requisitos

- **Google Chrome**: Versão 88+ (Manifest V3)
- **Permissões**: 
  - `activeTab`: Acesso à aba ativa
  - `scripting`: Executar scripts
  - `storage`: Salvar configurações
  - `alarms`: Reset automático diário
  - `host_permissions`: LinkedIn

## ⚠️ Limitações

- **Estrutura do LinkedIn**: Mudanças no DOM podem afetar a funcionalidade
- **Detecção**: Uso excessivo pode resultar em bloqueio temporário
- **Rate Limiting**: Respeite os limites configurados

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar bugs via *issues*
- 💡 Sugerir melhorias via *pull requests*
- 🌟 Compartilhar ideias para novas funcionalidades
- 📖 Melhorar a documentação

## 📄 Licença

Este projeto é open-source e está licenciado sob a **MIT License**. Use, modifique e distribua livremente.

## 📞 Suporte

Encontrou algum problema? Abra uma *issue* no repositório com:
- Descrição do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Versão do Chrome e da extensão

---

**Desenvolvido com ❤️ para a comunidade LinkedIn**