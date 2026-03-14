/* blog.js - オリジナルブログ記事用スクリプト */
(function() {
  'use strict';

  // 関連記事の動的読み込み
  function loadRelatedArticles() {
    var container = document.getElementById('relatedArticles');
    if (!container) return;

    var currentSlug = container.dataset.current || '';

    fetch('/blog/data/articles.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var articles = data.articles.filter(function(a) {
          return a.slug !== currentSlug;
        });
        // ランダムに3件選択
        var shuffled = articles.sort(function() { return 0.5 - Math.random(); });
        var selected = shuffled.slice(0, 3);

        container.innerHTML = selected.map(function(a) {
          return '<a href="/blog/articles/' + a.slug + '.html" class="related-card">' +
            '<div class="card-category">' + escapeHtml(a.category) + '</div>' +
            '<div class="card-title">' + escapeHtml(a.title) + '</div>' +
          '</a>';
        }).join('');
      })
      .catch(function() {
        container.innerHTML = '';
      });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRelatedArticles);
  } else {
    loadRelatedArticles();
  }
})();
