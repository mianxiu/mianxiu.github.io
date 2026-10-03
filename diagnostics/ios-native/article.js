// Isolated document-flow control: deliberately does not load the site's app shell.
document.getElementById('viewport-mode').textContent = '当前：' +
    document.querySelector('meta[name="viewport"]').content;

async function loadArticleControl() {
    const article = document.getElementById('article');
    try {
        const response = await fetch('/essay/2020/11/14/' +
            encodeURIComponent('yeah you say but sometime i want to quit') + '/context.html');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        doc.querySelectorAll('script, #mixxopost, .footer').forEach(element => element.remove());
        article.replaceChildren(...doc.body.childNodes);
    } catch (error) {
        article.textContent = '文章加载失败：' + error.message;
    }
}
loadArticleControl();
