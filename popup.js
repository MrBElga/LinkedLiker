let isActive = false;
let isPaused = false;
let likeCount = 0;
let dailyLikes = 0;
let sessionTime = 0;
let showSettings = false;

// Configurações padrão
let settings = {
    minDelay: 3000,
    maxDelay: 8000,
    maxLikesPerCycle: 30,
    maxLikesPerDay: 200,
    enableRandomDelays: true,
    scrollSpeed: 1500
};

// Carregar estado e configurações ao abrir o pop-up
chrome.storage.local.get(['isActive', 'likeCount', 'dailyLikes', 'settings'], function (data) {
    isActive = data.isActive || false;
    likeCount = data.likeCount || 0;
    dailyLikes = data.dailyLikes || 0;
    
    if (data.settings) {
        settings = { ...settings, ...data.settings };
        updateSettingsUI();
    }

    updateUI();
});

// Atualizar UI
function updateUI() {
    const button = document.getElementById('toggleButton');
    const pauseButton = document.getElementById('pauseButton');
    const status = document.getElementById('status');
    const likeCountElement = document.getElementById('likeCount');
    const dailyLikesElement = document.getElementById('dailyLikes');
    const sessionTimeElement = document.getElementById('sessionTime');
    const likesPerHourElement = document.getElementById('likesPerHour');

    button.textContent = isActive ? 'Desligar' : 'Ligar';
    status.textContent = isPaused ? 'Pausado' : (isActive ? 'Ativo' : 'Desativado');
    status.className = isPaused ? 'status paused' : (isActive ? 'status active' : 'status');
    
    likeCountElement.textContent = likeCount;
    dailyLikesElement.textContent = `${dailyLikes}/${settings.maxLikesPerDay}`;
    
    if (pauseButton) {
        pauseButton.style.display = isActive ? 'block' : 'none';
        pauseButton.textContent = isPaused ? 'Retomar' : 'Pausar';
    }
    
    // Calcular estatísticas
    if (sessionTime > 0) {
        const hours = sessionTime / 3600;
        const likesPerHour = hours > 0 ? Math.round(likeCount / hours) : 0;
        sessionTimeElement.textContent = formatTime(sessionTime);
        likesPerHourElement.textContent = likesPerHour;
    } else {
        sessionTimeElement.textContent = '00:00';
        likesPerHourElement.textContent = '0';
    }
}

function updateSettingsUI() {
    document.getElementById('minDelay').value = settings.minDelay;
    document.getElementById('maxDelay').value = settings.maxDelay;
    document.getElementById('maxLikesPerCycle').value = settings.maxLikesPerCycle;
    document.getElementById('maxLikesPerDay').value = settings.maxLikesPerDay;
    document.getElementById('enableRandomDelays').checked = settings.enableRandomDelays;
    document.getElementById('scrollSpeed').value = settings.scrollSpeed;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Botão de ligar/desligar
document.getElementById('toggleButton').addEventListener('click', () => {
    isActive = !isActive;

    chrome.storage.local.set({ isActive: isActive }, function () {
        console.log('Estado salvo:', isActive);
    });

    updateUI();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: isActive ? 'start' : 'stop' });
    });
});

// Botão de pausar/retomar
document.getElementById('pauseButton')?.addEventListener('click', () => {
    isPaused = !isPaused;
    updateUI();
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: isPaused ? 'pause' : 'resume' });
    });
});

// Botão de configurações
document.getElementById('settingsButton')?.addEventListener('click', () => {
    const settingsPanel = document.getElementById('settingsPanel');
    const mainPanel = document.getElementById('mainPanel');
    
    if (settingsPanel && mainPanel) {
        settingsPanel.style.display = 'block';
        mainPanel.style.display = 'none';
    }
});

// Botão de voltar das configurações
document.getElementById('backButton')?.addEventListener('click', () => {
    const settingsPanel = document.getElementById('settingsPanel');
    const mainPanel = document.getElementById('mainPanel');
    
    if (settingsPanel && mainPanel) {
        settingsPanel.style.display = 'none';
        mainPanel.style.display = 'block';
    }
});

// Salvar configurações
document.getElementById('saveSettings')?.addEventListener('click', () => {
    settings.minDelay = parseInt(document.getElementById('minDelay').value);
    settings.maxDelay = parseInt(document.getElementById('maxDelay').value);
    settings.maxLikesPerCycle = parseInt(document.getElementById('maxLikesPerCycle').value);
    settings.maxLikesPerDay = parseInt(document.getElementById('maxLikesPerDay').value);
    settings.enableRandomDelays = document.getElementById('enableRandomDelays').checked;
    settings.scrollSpeed = parseInt(document.getElementById('scrollSpeed').value);
    
    chrome.storage.local.set({ settings: settings }, function() {
        console.log('Configurações salvas:', settings);
        
        // Atualizar configurações no content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'updateSettings', settings: settings });
        });
        
        // Voltar para tela principal
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('mainPanel').style.display = 'block';
        
        updateUI();
    });
});

// Atualizar contador de likes e estatísticas
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateLikeCount') {
        likeCount = request.likeCount;
        sessionTime = request.sessionTime || 0;
        
        chrome.storage.local.get(['dailyLikes'], function(data) {
            dailyLikes = data.dailyLikes || 0;
            updateUI();
        });

        chrome.storage.local.set({ likeCount: likeCount }, function () {
            console.log('Contador de likes salvo:', likeCount);
        });
    } else if (request.action === 'showError') {
        const status = document.getElementById('status');
        status.textContent = request.message;
        status.className = 'status error';
        
        isActive = false;
        updateUI();
    } else if (request.action === 'resetState') {
        isActive = false;
        isPaused = false;
        likeCount = 0;
        sessionTime = 0;

        updateUI();

        chrome.storage.local.set({ isActive: false, likeCount: 0 }, function () {
            console.log('Estado resetado.');
        });
    } else if (request.action === 'paused') {
        isPaused = true;
        updateUI();
    } else if (request.action === 'resumed') {
        isPaused = false;
        updateUI();
    } else if (request.action === 'stopped') {
        isActive = false;
        isPaused = false;
        updateUI();
    }
});