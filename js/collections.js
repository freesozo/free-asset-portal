// collections.js – マイコレクション (My Collections) board management
(function() {
  const COLLECTIONS_KEY = 'freesozo-collections';
  let sitesData = [];

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function loadCollections() {
    try { return JSON.parse(localStorage.getItem(COLLECTIONS_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveCollections(c) {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(c));
  }

  function openModal() {
    document.getElementById('boardModal').style.display = 'flex';
    document.getElementById('boardNameInput').value = '';
    document.getElementById('boardNameInput').focus();
  }

  function closeModal() {
    document.getElementById('boardModal').style.display = 'none';
  }

  function createBoard() {
    const name = document.getElementById('boardNameInput').value.trim();
    if (!name) return;
    const icon = document.querySelector('.icon-option.selected')?.dataset.icon || 'other';
    const collections = loadCollections();
    collections.push({
      id: 'board-' + Date.now(),
      name: name,
      icon: icon,
      sites: [],
      createdAt: new Date().toISOString()
    });
    saveCollections(collections);
    closeModal();
    renderBoards();
  }

  function deleteBoard(boardId) {
    const msg = (typeof I18n !== 'undefined' && I18n.getLang() === 'en')
      ? 'Delete this board?'
      : 'このボードを削除しますか？';
    if (!confirm(msg)) return;
    const collections = loadCollections().filter(b => b.id !== boardId);
    saveCollections(collections);
    renderBoards();
  }

  function removeSiteFromBoard(boardId, siteId) {
    const collections = loadCollections();
    const board = collections.find(b => b.id === boardId);
    if (board) {
      board.sites = board.sites.filter(id => id !== siteId);
      saveCollections(collections);
      renderBoards();
    }
  }

  const BOARD_ICONS = {
    web: '\uD83C\uDF10', video: '\uD83C\uDFAC', game: '\uD83C\uDFAE',
    design: '\uD83C\uDFA8', music: '\uD83C\uDFB5', other: '\uD83D\uDCC1'
  };

  function renderBoardSite(siteId, boardId) {
    const site = sitesData.find(s => s.id === siteId);
    if (!site) return '';
    const name = (typeof I18n !== 'undefined')
      ? I18n.localize(site.name)
      : (typeof site.name === 'object' ? (site.name.ja || site.name.en) : site.name);
    return '<div class="board-site-item">' +
      '<a href="detail.html?id=' + siteId + '" class="board-site-link">' + escapeHtml(name) + '</a>' +
      '<button class="board-site-remove" onclick="window._removeSite(\'' + boardId + '\',\'' + siteId + '\')" title="' +
        ((typeof I18n !== 'undefined' && I18n.getLang() === 'en') ? 'Remove' : '削除') +
      '">\u00D7</button>' +
    '</div>';
  }

  function renderBoards() {
    const container = document.getElementById('boardsContainer');
    if (!container) return;
    const collections = loadCollections();
    const isEn = (typeof I18n !== 'undefined' && I18n.getLang() === 'en');

    if (collections.length === 0) {
      container.innerHTML =
        '<div class="empty-collections">' +
          '<p>' + (isEn ? 'No boards yet' : 'まだボードがありません') + '</p>' +
          '<p class="empty-hint">' +
            (isEn
              ? 'Get started by clicking "Create New Board".<br>You can add sites from the site detail page.'
              : '「新しいボードを作成」から始めましょう。<br>サイト詳細ページからボードにサイトを追加できます。') +
          '</p>' +
        '</div>';
      return;
    }

    container.innerHTML = collections.map(function(board) {
      var sitesHtml = '';
      if (board.sites.length === 0) {
        sitesHtml = '<p class="board-empty">' +
          (isEn ? 'Add sites from the detail page' : 'サイト詳細ページからこのボードに追加できます') +
          '</p>';
      } else {
        sitesHtml = board.sites.map(function(siteId) {
          return renderBoardSite(siteId, board.id);
        }).join('');
      }
      return '<div class="board-card" data-board-id="' + board.id + '">' +
        '<div class="board-header">' +
          '<span class="board-icon">' + (BOARD_ICONS[board.icon] || '\uD83D\uDCC1') + '</span>' +
          '<h3 class="board-name">' + escapeHtml(board.name) + '</h3>' +
          '<span class="board-count">' + board.sites.length + (isEn ? ' sites' : '件') + '</span>' +
          '<button class="board-delete" onclick="window._deleteBoard(\'' + board.id + '\')" title="' + (isEn ? 'Delete' : '削除') + '">\u00D7</button>' +
        '</div>' +
        '<div class="board-sites">' + sitesHtml + '</div>' +
      '</div>';
    }).join('');
  }

  // Expose for onclick handlers
  window._deleteBoard = deleteBoard;
  window._removeSite = removeSiteFromBoard;

  // Init
  document.addEventListener('DOMContentLoaded', async function() {
    // Load sites data
    try {
      var res = await fetch('data/sites.json');
      var json = await res.json();
      sitesData = json.sites || [];
    } catch(e) {
      console.error('Failed to load sites data:', e);
    }

    // Add board button
    document.getElementById('addBoardBtn').addEventListener('click', openModal);
    document.getElementById('createBoardBtn').addEventListener('click', createBoard);
    document.getElementById('cancelBoardBtn').addEventListener('click', closeModal);

    // Icon picker
    document.getElementById('boardIconPicker').addEventListener('click', function(e) {
      var btn = e.target.closest('.icon-option');
      if (!btn) return;
      document.querySelectorAll('.icon-option').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
    });

    // Close modal on overlay click
    document.getElementById('boardModal').addEventListener('click', function(e) {
      if (e.target === document.getElementById('boardModal')) closeModal();
    });

    // Enter key in input
    document.getElementById('boardNameInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') createBoard();
    });

    // Theme toggle
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        var html = document.documentElement;
        var next = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = next;
        localStorage.setItem('theme', next);
      });
    }

    // Language toggle
    var langBtn = document.getElementById('langBtn');
    if (langBtn && typeof I18n !== 'undefined') {
      langBtn.addEventListener('click', function() {
        I18n.toggle();
        renderBoards();
      });
    }

    // Hamburger menu
    var hamburgerBtn = document.getElementById('hamburgerBtn');
    var mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('open');
      });
    }

    // Back to top
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
      window.addEventListener('scroll', function() {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
      });
      backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Re-render on language change
    window.addEventListener('langchange', function() {
      renderBoards();
    });

    renderBoards();
  });
})();
