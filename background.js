// Resetar estado quando a extensão é suspensa ou instalada
chrome.runtime.onSuspend.addListener(() => {
    console.log("Extensão suspensa, resetando estado...");
    chrome.storage.local.set({ isActive: false, likeCount: 0 }, function () {
        console.log("Estado resetado.");
    });
});

// Inicializar estado quando a extensão é instalada/atualizada
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('LinkedLiker instalado com sucesso!');
        const today = new Date().toDateString();
        chrome.storage.local.set({
            isActive: false,
            likeCount: 0,
            dailyLikes: 0,
            lastResetDate: today,
            settings: {
                minDelay: 3000,
                maxDelay: 8000,
                maxLikesPerCycle: 30,
                maxLikesPerDay: 200,
                enableRandomDelays: true,
                scrollSpeed: 1500
            }
        });
    } else if (details.reason === 'update') {
        console.log('LinkedLiker atualizado para versão 2.0.0');
        // Preservar configurações existentes mas adicionar novas se necessário
        chrome.storage.local.get(['settings'], function(data) {
            const defaultSettings = {
                minDelay: 3000,
                maxDelay: 8000,
                maxLikesPerCycle: 30,
                maxLikesPerDay: 200,
                enableRandomDelays: true,
                scrollSpeed: 1500
            };
            const settings = { ...defaultSettings, ...data.settings };
            chrome.storage.local.set({ settings: settings });
        });
    }
});

// Resetar contador diário à meia-noite
chrome.alarms.create('dailyReset', { periodInMinutes: 1440 }); // 24 horas

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        const today = new Date().toDateString();
        chrome.storage.local.get(['lastResetDate'], function(data) {
            if (data.lastResetDate !== today) {
                chrome.storage.local.set({
                    dailyLikes: 0,
                    lastResetDate: today,
                    likeCount: 0
                });
                console.log('Contador diário resetado');
            }
        });
    }
});
