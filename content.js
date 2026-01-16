let intervalId;
let clickedDivs = new Set();
let likeCount = 0;
let errorCount = 0;
let isPaused = false;
let sessionStartTime = null;
let settings = {
    minDelay: 3000,
    maxDelay: 8000,
    maxLikesPerCycle: 30,
    maxLikesPerDay: 200,
    enableRandomDelays: true,
    scrollSpeed: 1500
};

const maxRetries = 3;
const CLEANUP_INTERVAL = 100; // Limpar clickedDivs a cada 100 elementos
let observer = null; // MutationObserver para detectar novos posts

// Carregar configurações salvas
chrome.storage.local.get(['settings', 'dailyLikes', 'lastResetDate'], function(data) {
    if (data.settings) {
        settings = { ...settings, ...data.settings };
    }
    
    // Resetar contador diário se for um novo dia
    const today = new Date().toDateString();
    if (data.lastResetDate !== today) {
        chrome.storage.local.set({ 
            dailyLikes: 0, 
            lastResetDate: today,
            isActive: false, 
            likeCount: 0 
        });
    } else {
        chrome.storage.local.set({ isActive: false, likeCount: 0 });
    }
    
    console.log("Estado resetado ao carregar a página.");
});

// Função para gerar delay aleatório (anti-detecção)
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para simular comportamento humano (pequenos delays entre ações)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Verificar limite diário
async function checkDailyLimit() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['dailyLikes'], function(data) {
            const dailyLikes = data.dailyLikes || 0;
            resolve(dailyLikes < settings.maxLikesPerDay);
        });
    });
}

// Atualizar contador diário
function updateDailyCount() {
    chrome.storage.local.get(['dailyLikes'], function(data) {
        const dailyLikes = (data.dailyLikes || 0) + 1;
        chrome.storage.local.set({ dailyLikes: dailyLikes });
        
        // Notificar se atingir o limite
        if (dailyLikes >= settings.maxLikesPerDay) {
            chrome.runtime.sendMessage({ 
                action: 'showError', 
                message: `Limite diário atingido (${settings.maxLikesPerDay} curtidas)` 
            });
            stopAutoliker();
        }
    });
}

// Limpar elementos antigos do Set para economizar memória
function cleanupClickedDivs() {
    if (clickedDivs.size > CLEANUP_INTERVAL) {
        const array = Array.from(clickedDivs);
        clickedDivs = new Set(array.slice(-50)); // Manter apenas os últimos 50
    }
}

async function clickVisibleDivs() {
    if (isPaused) return;
    
    const canLike = await checkDailyLimit();
    if (!canLike) {
        console.log("Limite diário atingido.");
        return;
    }
    
    const divs = document.querySelectorAll('.react-button__trigger:not(.processed)');
    let likesThisCycle = 0;

    for (const div of divs) {
        if (likesThisCycle >= settings.maxLikesPerCycle) break;
        if (isPaused) break;
        
        if (div.querySelector('img') === null) {
            if (div && div.isConnected) {
                try {
                    // Delay aleatório antes de clicar (comportamento humano)
                    if (settings.enableRandomDelays) {
                        await sleep(getRandomDelay(500, 2000));
                    }
                    
                    div.click();
                    div.classList.add('processed');
                    clickedDivs.add(div);
                    likeCount += 1;
                    likesThisCycle += 1;
                    errorCount = 0;
                    
                    updateDailyCount();
                    cleanupClickedDivs();

                    try {
                        chrome.runtime.sendMessage({ 
                            action: 'updateLikeCount', 
                            likeCount: likeCount,
                            sessionTime: getSessionTime()
                        }, function (response) {
                            if (chrome.runtime.lastError) {
                                console.warn("Erro ao enviar mensagem:", chrome.runtime.lastError);
                            }
                        });
                    } catch (error) {
                        console.warn("Erro ao enviar mensagem:", error);
                    }

                    console.log("Curtido:", div);
                } catch (error) {
                    console.warn("Erro ao clicar:", error);
                    handleError();
                }
            } else {
                console.warn("Elemento não encontrado ou não está mais no DOM.");
            }
        }
    }
}

function scrollAndLoadMore() {
    if (isPaused) return;
    
    window.scrollBy(0, settings.scrollSpeed);
    const loadMoreButton = document.querySelector('[data-tracking-control-name="feed-load-more"]');
    if (loadMoreButton && loadMoreButton.offsetParent !== null) {
        try {
            loadMoreButton.click();
            console.log("Carregando mais conteúdo...");
        } catch (error) {
            console.warn("Erro ao carregar mais conteúdo:", error);
            handleError();
        }
    }
}

// Função para ver novos posts (multi-idioma)
function clickNewPostsButton() {
    if (isPaused) return;
    
    // Seletores para múltiplos idiomas
    const selectors = [
        '.artdeco-button--primary[aria-label*="novas publicações"]', // PT
        '.artdeco-button--primary[aria-label*="new posts"]', // EN
        '.artdeco-button--primary[aria-label*="nuevas publicaciones"]', // ES
        '.artdeco-button--primary[aria-label*="nouveaux posts"]', // FR
        '.artdeco-button--primary[aria-label*="neue Beiträge"]' // DE
    ];
    
    for (const selector of selectors) {
        const newPostsButton = document.querySelector(selector);
        if (newPostsButton && newPostsButton.offsetParent !== null) {
            try {
                newPostsButton.click();
                console.log("Clicado no botão 'Ver novas publicações'.");
                break;
            } catch (error) {
                console.warn("Erro ao clicar no botão 'Ver novas publicações':", error);
            }
        }
    }
}

// Calcular tempo de sessão
function getSessionTime() {
    if (!sessionStartTime) return 0;
    return Math.floor((Date.now() - sessionStartTime) / 1000); // em segundos
}

function stopAutoliker() {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = false;
    sessionStartTime = null;
    chrome.runtime.sendMessage({ action: 'stopped' });
}

function handleError() {
    errorCount += 1;

    if (errorCount >= maxRetries) {
        console.log("Número máximo de tentativas atingido. Parando...");
        stopAutoliker();
        chrome.runtime.sendMessage({ action: 'showError', message: 'Erro ao curtir posts. Tente novamente mais tarde.' });
    }
}

// Monitorar erros de rede
window.addEventListener('error', (event) => {
    if (event.message.includes('net::ERR_BLOCKED_BY_CLIENT') || event.message.includes('Failed to fetch')) {
        console.warn("Erro de rede detectado:", event.message);
        handleError();
    }
});

// MutationObserver para detectar novos posts eficientemente
function initMutationObserver() {
    if (observer) return; // Já existe
    
    const feedContainer = document.querySelector('.scaffold-layout__list');
    if (!feedContainer) {
        console.warn('Container do feed não encontrado');
        return;
    }
    
    observer = new MutationObserver((mutations) => {
        // Apenas processar se estiver ativo e não pausado
        if (!intervalId || isPaused) return;
        
        // Debounce: processar alterações em lote
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                // Novos posts detectados
                console.log('Novos posts detectados pelo Observer');
                break;
            }
        }
    });
    
    observer.observe(feedContainer, {
        childList: true,
        subtree: true
    });
    
    console.log('MutationObserver inicializado');
}

function stopMutationObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
        console.log('MutationObserver desconectado');
    }
}

// Message listener único (removido verificação duplicada)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        if (!intervalId) {
            sessionStartTime = Date.now();
            isPaused = false;
            
            // Inicializar MutationObserver
            initMutationObserver();
            
            // Intervalo aleatório entre execuções
            const runCycle = async () => {
                await clickVisibleDivs();
                scrollAndLoadMore();
                clickNewPostsButton();
                
                // Próximo ciclo com delay aleatório
                if (intervalId) {
                    const delay = getRandomDelay(settings.minDelay, settings.maxDelay);
                    intervalId = setTimeout(runCycle, delay);
                }
            };
            
            intervalId = setTimeout(runCycle, 1000);
            console.log("Auto-liker iniciado com intervalos aleatórios.");
        }
    } else if (request.action === 'stop') {
        clearInterval(intervalId);
        clearTimeout(intervalId);
        intervalId = null;
        isPaused = false;
        sessionStartTime = null;

        // Parar MutationObserver
        stopMutationObserver();

        // Resetar
        clickedDivs.clear();
        likeCount = 0;
        errorCount = 0;

        chrome.runtime.sendMessage({ action: 'resetState' });
        console.log("Auto-liker parado e estado resetado.");
    } else if (request.action === 'pause') {
        isPaused = true;
        console.log("Auto-liker pausado.");
        chrome.runtime.sendMessage({ action: 'paused' });
    } else if (request.action === 'resume') {
        isPaused = false;
        console.log("Auto-liker retomado.");
        chrome.runtime.sendMessage({ action: 'resumed' });
    } else if (request.action === 'updateSettings') {
        settings = { ...settings, ...request.settings };
        console.log("Configurações atualizadas:", settings);
    }
});