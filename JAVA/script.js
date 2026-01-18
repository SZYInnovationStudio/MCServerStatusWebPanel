document.addEventListener('DOMContentLoaded', async () => {
    const backHomeBtn = document.getElementById('back-home');

    backHomeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    try {
        const configRes = await fetch('./config.json');
        if (!configRes.ok) throw new Error('配置文件读取失败');
        const config = await configRes.json();

        document.getElementById('server-name').textContent = config.serverName;
        document.getElementById('server-address').textContent = config.serverAddress;

        const mcApiUrl = `https://api.mcsrvstat.us/2/${config.serverAddress}`;
        const serverRes = await fetch(mcApiUrl);
        if (!serverRes.ok) throw new Error('服务器信息获取失败');
        const serverData = await serverRes.json();

        if (!serverData.online) {
            setAllInfo('服务器已离线', '离线', '无数据', '0/∞', '暂无在线玩家');
            return;
        }

        const motd = serverData.motd.clean.join('<br>') || '无服务器标语'; 
        const version = judgeMcVersion(serverData.version) || '未知版本'; 
        const ping = serverData.ping ? `${serverData.ping} ms` : '≤10 ms'; 
        const players = `${serverData.players.online || 0}/${serverData.players.max || '∞'}`; 
        const playersList = getPlayersList(serverData.players.list); 

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

function judgeMcVersion(versionStr) {
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