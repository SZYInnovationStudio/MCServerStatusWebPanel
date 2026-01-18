document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serverType = urlParams.get('type') || 'java'; 
    
    const backHomeBtn = document.getElementById('back-home');
    const switchJavaBtn = document.getElementById('switch-java');
    const switchBedrockBtn = document.getElementById('switch-bedrock');

    backHomeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    switchJavaBtn.addEventListener('click', () => {
        window.location.href = 'status.html?type=java';
    });
    switchBedrockBtn.addEventListener('click', () => {
        window.location.href = 'status.html?type=bedrock';
    });
    if (serverType === 'java') {
        switchJavaBtn.classList.add('active');
    } else {
        switchBedrockBtn.classList.add('active');
    }

    try {
        const configRes = await fetch('./config.json');
        if (!configRes.ok) throw new Error('配置文件读取失败');
        const config = await configRes.json();

        const targetAddress = serverType === 'java' 
            ? config.javaAddress 
            : config.bedrockAddress;
        
        document.getElementById('server-name').textContent = config.serverName;
        document.getElementById('server-address').textContent = targetAddress;

        let serverData;
        if (serverType === 'java') {
            const mcApiUrl = `https://api.mcsrvstat.us/2/${targetAddress}`;
            const serverRes = await fetch(mcApiUrl);
            if (!serverRes.ok) throw new Error('Java版服务器信息获取失败');
            serverData = await serverRes.json();
        } else {
            const bedrockApiUrl = `https://api.mcsrvstat.us/bedrock/2/${targetAddress.split(':')[0]}:${targetAddress.split(':')[1] || 19132}`;
            const serverRes = await fetch(bedrockApiUrl);
            if (!serverRes.ok) throw new Error('基岩版服务器信息获取失败');
            serverData = await serverRes.json();
        }

        if (!serverData.online) {
            setAllInfo('服务器已离线', '离线', '无数据', '0/∞', '暂无在线玩家');
            return;
        }

        const motd = serverData.motd?.clean?.join('<br>') || serverData.motd?.raw?.join('<br>') || '无服务器标语';
        const version = judgeMcVersion(serverData.version, serverType) || '未知版本';
        const ping = serverData.ping ? `${serverData.ping} ms` : '≤10 ms';
        const players = `${serverData.players?.online || 0}/${serverData.players?.max || '∞'}`;
        const playersList = getPlayersList(serverData.players?.list || []);

        document.getElementById('server-motd').innerHTML = motd;
        document.getElementById('server-version').textContent = version;
        document.getElementById('server-ping').textContent = ping;
        document.getElementById('server-players').textContent = players;
        document.getElementById('players-list').innerHTML = playersList;

    } catch (error) {
        console.error('加载失败:', error);
        setAllInfo('加载失败', '获取异常', '无数据', '0/∞', '<span class="empty-tip">加载出错，请稍后重试</span>');
    }
});

function judgeMcVersion(versionStr, serverType) {
    if (serverType === 'bedrock') return 'BEDROCK 基岩版';
    if (!versionStr) return '未知版本';
    const bedrockKeywords = ['基岩', 'Bedrock', 'PE', 'BE', 'MCPE'];
    return bedrockKeywords.some(k => versionStr.includes(k)) ? 'BEDROCK 基岩版' : 'JAVA 原版';
}

function getPlayersList(players) {
    if (!players || players.length === 0) {
        return '<span class="empty-tip">暂无在线玩家</span>';
    }
    return players.map(name => `▸ ${name}`).join('<br>');
}

function setAllInfo(motd, version, ping, players, playerList) {
    document.getElementById('server-motd').textContent = motd;
    document.getElementById('server-version').textContent = version;
    document.getElementById('server-ping').textContent = ping;
    document.getElementById('server-players').textContent = players;
    document.getElementById('players-list').innerHTML = playerList;
}