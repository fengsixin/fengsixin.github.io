/* global NexT, boot, CONFIG */
window.NexT = {};
NexT.boot = {};
NexT.plugins = {};

// Defined comment component & add register event
NexT.plugins.comments = {};
NexT.plugins.comments.register = function() {
  if (!NexT.CONFIG.page.comments) return;
  for(var c in NexT.plugins.comments) { 
    if (c === 'register') continue;
    eval('NexT.plugins.comments.'+c)();
  };
}

// Defined search engine & add register event
NexT.plugins.search = {}
NexT.plugins.search.register = function() {
  for(var s in NexT.plugins.search) { 
    if (s === 'register') continue;
    eval('NexT.plugins.search.'+s)();
  };
}

// Defined share plugin & add register event
NexT.plugins.share = {}
NexT.plugins.share.register = function() {
  for(var s in NexT.plugins.share) { 
    if (s === 'register') continue;
    eval('NexT.plugins.share.'+s)();
  };
}

// Defined other plugin & add register event
NexT.plugins.others = {}
NexT.plugins.others.register = function() {
  for(var o in NexT.plugins.others) { 
    if (o === 'register') continue;
    eval('NexT.plugins.others.'+o)();
  };
}

// Add event to register all third party plugins
NexT.plugins.register = function() {
  for(var p in NexT.plugins) {
    if (p === 'register') continue;
    eval('NexT.plugins.'+p+'.register')();
  }
};

(function() {
  const className = 'next-config';

  const staticConfig = {};
  let variableConfig = {};

  const parse = text => JSON.parse(text || '{}');

  const update = name => {
    const targetEle = document.querySelector(`.${className}[data-name="${name}"]`);
    if (!targetEle) return;
    const parsedConfig = parse(targetEle.text);
    if (name === 'main') {
      Object.assign(staticConfig, parsedConfig);
    } else {
      variableConfig[name] = parsedConfig;
    }
  };

  update('main');

  window.NexT.CONFIG = new Proxy({}, {
    get(overrideConfig, name) {
      let existing;
      if (name in staticConfig) {
        existing = staticConfig[name];
      } else {
        if (!(name in variableConfig)) update(name);
        existing = variableConfig[name];
      }

      // For unset override and mixable existing
      if (!(name in overrideConfig) && typeof existing === 'object') {
        // Get ready to mix.
        overrideConfig[name] = {};
      }

      if (name in overrideConfig) {
        const override = overrideConfig[name];

        // When mixable
        if (typeof override === 'object' && typeof existing === 'object') {
          // Mix, proxy changes to the override.
          return new Proxy({ ...existing, ...override }, {
            set(target, prop, value) {
              target[prop] = value;
              override[prop] = value;
              return true;
            }
          });
        }

        return override;
      }

      // Only when not mixable and override hasn't been set.
      return existing;
    }
  });

  // TODO
  // document.addEventListener('pjax:success', () => {
  //   variableConfig = {};
  // });
})();
;
/* util tools */

HTMLElement.prototype.wrap = function (wrapper) {
  this.parentNode.insertBefore(wrapper, this);
  this.parentNode.removeChild(this);
  wrapper.appendChild(this);
};

NexT.utils = {
  registerImageLoadEvent: function() {
    const images = document.querySelectorAll('.sidebar img, .post-block img, .vendors-list img');
			
    const callback = (entries) => {
      entries.forEach(item => {
        if (item.intersectionRatio > 0) {
          let ele = item.target;
          let imgSrc = ele.getAttribute('data-src');
          if (imgSrc) {
            let img = new Image();
            img.addEventListener('load', function() {
              ele.src = imgSrc;
            }, false);
            ele.src = imgSrc;
            // Prevent load image again
            ele.removeAttribute('data-src');
          }
        }
      })
    };
      
    const observer = new IntersectionObserver(callback);
    images.forEach(img => {
      observer.observe(img);
    });
  },

  registerImageViewer: function() {
    new Viewer(document.querySelector('.post-body'),{ navbar:2, toolbar:2 });
  },

  registerToolButtons: function () {
    const buttons = document.querySelector('.tool-buttons');
    
    const scrollbar_buttons = buttons.querySelectorAll('div:not(#toggle-theme)');
    scrollbar_buttons.forEach(button => {
      let targetId = button.id;
      if (targetId != '') {
        targetId = targetId.substring(5);
      }
      button.addEventListener('click', () => {
        this.slidScrollBarAnime(targetId);
      });
    });

    buttons.querySelector('div#toggle-theme').addEventListener('click', () => {
      const cur_theme = document.documentElement.getAttribute('data-theme');
      window.theme.toggle(cur_theme === 'dark' ? 'light' : 'dark');
    });
  },

  slidScrollBarAnime: function (targetId, easing = 'linear', duration = 500) {
    const targetObj = document.getElementById(targetId);
   
    window.anime({
      targets: document.scrollingElement,
      duration: duration,
      easing: easing,
      scrollTop:  targetId == '' || !targetObj ? 0 : targetObj.getBoundingClientRect().top + window.scrollY
    });
  },

  domAddClass: function (selector, cls) {
    const doms = document.querySelectorAll(selector);
    if (doms) {
      doms.forEach(dom => {
        dom.classList.add(cls);
      });
    }
  },

  fmtSiteInfo: function () {
    const runtimeCount = document.getElementById('runTimes');
    if (runtimeCount) {
      const publishDate = runtimeCount.getAttribute('data-publishDate');
      const runTimes = this.diffDate(publishDate, 2);
      runtimeCount.innerText = runTimes;
    }

    const wordsCount = document.getElementById('wordsCount');
    if (wordsCount) {
      const words = wordsCount.getAttribute('data-count');
      wordsCount.innerText = this.numberFormat(words);
    }

    const readTimes = document.getElementById('readTimes');
    if (readTimes) {
      const times = readTimes.getAttribute('data-times');

      const hour = 60;
      const day = hour * 24;

      const daysCount = parseInt(times / day);
      const hoursCount = parseInt(times / hour);

      let timesLabel;
      if (daysCount >= 1) {
        timesLabel = daysCount + NexT.CONFIG.i18n.ds_days + parseInt((times - daysCount * day) / hour) + NexT.CONFIG.i18n.ds_hours;
      } else if (hoursCount >= 1) {
        timesLabel = hoursCount + NexT.CONFIG.i18n.ds_hours + (times - hoursCount * hour) + NexT.CONFIG.i18n.ds_mins;
      } else {
        timesLabel = times + NexT.CONFIG.i18n.ds_mins;
      }

      readTimes.innerText = timesLabel;
    }

    const lastPushDate = document.getElementById('last-push-date');
    if (lastPushDate) {
      const pushDateVal = this.diffDate(lastPushDate.getAttribute('data-lastPushDate'), 1);
      lastPushDate.innerText = pushDateVal;
    }
  },

  fmtLaWidget: function(){
    setTimeout(function(){
      const laWidget = document.querySelectorAll('#la-siteinfo-widget span');
      if (laWidget.length > 0) {
        const valIds = [0, 2, 4, 6];
        const domIds = ['today_site_pv', 'yesterday_site_pv', 'month_site_pv', 'total_site_pv']
        for (let i in valIds) {
          let pv = NexT.utils.numberFormat(laWidget[valIds[i]].innerText);
          document.getElementById(domIds[i]).innerText = pv;
        }
      }
    }, 800);
  },

  fmtBusuanzi: function () {
    setTimeout(function(){
      const bszUV = document.getElementById('busuanzi_value_site_uv');    
      if (bszUV) {
        bszUV.innerText = NexT.utils.numberFormat(bszUV.innerText);
      }
      const bszPV = document.getElementById('busuanzi_value_site_pv');
      if (bszPV) {
        bszPV.innerText = NexT.utils.numberFormat(bszPV.innerText);
      }
    }, 800);  
  },

  numberFormat: function (number) {
    let result;
    if (number.indexOf(',') > 0) {
      number = number.replaceAll(",", "");
    }

    if (number > 10000) {
      result = (number / 10000.0).toFixed(2) + ' w';
    } else if (number > 1000) {
      result = (number / 1000.0).toFixed(2) + ' k';
    } else {
      result = number;
    }
    return result;
  },

  diffDate: function (date, mode = 0) {
    const dateNow = new Date();
    const datePost = new Date(date);
    const dateDiff = dateNow.getTime() - datePost.getTime();
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;

    let result;
    if (mode == 1) {
      const monthCount = dateDiff / month;
      const dayCount = dateDiff / day;
      const hourCount = dateDiff / hour;
      const minuteCount = dateDiff / minute;

      if (monthCount > 12) {
        result = datePost.toLocaleDateString().replace(/\//g, '-');
      } else if (monthCount >= 1) {
        result = parseInt(monthCount) + NexT.CONFIG.i18n.ds_month;
      } else if (dayCount >= 1) {
        result = parseInt(dayCount) + NexT.CONFIG.i18n.ds_day;
      } else if (hourCount >= 1) {
        result = parseInt(hourCount) + NexT.CONFIG.i18n.ds_hour;
      } else if (minuteCount >= 1) {
        result = parseInt(minuteCount) + NexT.CONFIG.i18n.ds_min;
      } else {
        result = NexT.CONFIG.i18n.ds_just;
      }
    } else if (mode == 2) {
      const yearCount = parseInt(dateDiff / year);
      if (yearCount >= 1) {
        const dayCount = parseInt((dateDiff - (yearCount * year)) / day);
        result = yearCount + NexT.CONFIG.i18n.ds_years + dayCount + NexT.CONFIG.i18n.ds_days;
      } else {
        const dayCount = parseInt(dateDiff / day);
        result = dayCount + NexT.CONFIG.i18n.ds_days;
      }
    } else {
      result = parseInt(dateDiff / day);
    }

    return result;
  },

  checkDOMExist: function (selector) {
    return document.querySelector(selector) != null;
  },

  getCDNResource: function (res) {
    let { plugins, router } = NexT.CONFIG.vendor;
    let { name, version, file, alias, alias_name } = res;

    let npm_name = name;
    if (alias_name) npm_name = alias_name;
    let res_src = '';
    switch (plugins) {
      case 'cdnjs':
      case 'bootcdn':
      case 'qiniu':
        let cdnjs_name = alias || name;
        let cdnjs_file = file.replace(/^(dist|lib|source|\/js|)\/(browser\/|)/, '');
        if (cdnjs_file.indexOf('min') == -1) {          
          cdnjs_file = cdnjs_file.replace(/\.js$/, '.min.js');
        }
        res_src = `${router}/${cdnjs_name}/${version}/${cdnjs_file}`
        break;
      default:
        res_src = `${router}/${npm_name}@${version}/${file}`
    }

    return res_src;
  },

  /**
   * One-click copy code support.
   */
  registerCopyCode: function () {
    if (!NexT.CONFIG.copybtn) return;

    let figure = document.querySelectorAll('.highlight pre');
    if (figure.length === 0 || !NexT.CONFIG.copybtn) return;
    figure.forEach(element => {
      let cn = element.querySelector('code').className;
      // TODO seems hard code need find other ways fixed it.
      if (cn == '') return;
      element.insertAdjacentHTML('beforeend', '<div class="copy-btn"><i class="fa fa-copy fa-fw"></i></div>');
      const button = element.querySelector('.copy-btn');
      button.addEventListener('click', () => {
        const lines = element.querySelector('.code') || element.querySelector('code');
        const code = lines.innerText;
        if (navigator.clipboard) {
          // https://caniuse.com/mdn-api_clipboard_writetext
          navigator.clipboard.writeText(code).then(() => {
            button.querySelector('i').className = 'fa fa-check-circle fa-fw';
          }, () => {
            button.querySelector('i').className = 'fa fa-times-circle fa-fw';
          });
        } else {
          const ta = document.createElement('textarea');
          ta.style.top = window.scrollY + 'px'; // Prevent page scrolling
          ta.style.position = 'absolute';
          ta.style.opacity = '0';
          ta.readOnly = true;
          ta.value = code;
          document.body.append(ta);
          ta.select();
          ta.setSelectionRange(0, code.length);
          ta.readOnly = false;
          const result = document.execCommand('copy');
          button.querySelector('i').className = result ? 'fa fa-check-circle fa-fw' : 'fa fa-times-circle fa-fw';
          ta.blur(); // For iOS
          button.blur();
          document.body.removeChild(ta);
        }
      });
      element.addEventListener('mouseleave', () => {
        setTimeout(() => {
          button.querySelector('i').className = 'fa fa-copy fa-fw';
        }, 300);
      });
    });
  },

  wrapTableWithBox: function () {
    document.querySelectorAll('table').forEach(element => {
      const box = document.createElement('div');
      box.className = 'table-container';
      element.wrap(box);
    });
  },

  registerVideoIframe: function () {
    document.querySelectorAll('iframe').forEach(element => {
      const supported = [
        'www.youtube.com',
        'player.vimeo.com',
        'player.youku.com',
        'player.bilibili.com',
        'www.tudou.com'
      ].some(host => element.src.includes(host));
      if (supported && !element.parentNode.matches('.video-container')) {
        const box = document.createElement('div');
        box.className = 'video-container';
        element.wrap(box);
        const width = Number(element.width);
        const height = Number(element.height);
        if (width && height) {
          box.style.paddingTop = (height / width * 100) + '%';
        }
      }
    });
  },

  registerScrollPercent: function () {
    const backToTop = document.querySelector('.back-to-top');
    const readingProgressBar = document.querySelector('.reading-progress-bar');
    // For init back to top in sidebar if page was scrolled after page refresh.
    window.addEventListener('scroll', () => {
      if (backToTop || readingProgressBar) {
        const contentHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = contentHeight > 0 ? Math.min(100 * window.scrollY / contentHeight, 100) : 0;
        if (backToTop) {
          const scrollPercentRound = Math.round(scrollPercent)
          const isShow = scrollPercentRound >= 5;
          backToTop.classList.toggle('back-to-top-on', isShow);
          backToTop.querySelector('span').innerText = scrollPercentRound + '%';
        }
        if (readingProgressBar) {
          readingProgressBar.style.setProperty('--progress', scrollPercent.toFixed(2) + '%');
        }
      }
      if (!Array.isArray(NexT.utils.sections)) return;
      let index = NexT.utils.sections.findIndex(element => {
        return element && element.getBoundingClientRect().top > 10;
      });
      if (index === -1) {
        index = NexT.utils.sections.length - 1;
      } else if (index > 0) {
        index--;
      }
      this.activateNavByIndex(index);
    }, { passive: true });
  },

  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function () {
    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    document.querySelectorAll('.tabs ul.nav-tabs .tab').forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        // Prevent selected tab to select again.
        if (element.classList.contains('active')) return;
        const nav = element.parentNode;
        // Add & Remove active class on `nav-tabs` & `tab-content`.
        [...nav.children].forEach(target => {
          target.classList.toggle('active', target === element);
        });
        // https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
        const tActive = document.getElementById(element.querySelector('a').getAttribute('href').replace('#', ''));
        [...tActive.parentNode.children].forEach(target => {
          // Array.prototype.slice.call(tActive.parentNode.children).forEach(target => {
          target.classList.toggle('active', target === tActive);
        });
        // Trigger event
        tActive.dispatchEvent(new Event('tabs:click', {
          bubbles: true
        }));
        if (!NexT.CONFIG.stickytabs) return;
        const offset = nav.parentNode.getBoundingClientRect().top + window.scrollY + 10;
        window.anime({
          targets: document.scrollingElement,
          duration: 500,
          easing: 'linear',
          scrollTop: offset
        });
      });
    });

    window.dispatchEvent(new Event('tabs:register'));
  },

  registerCanIUseTag: function () {
    // Get responsive height passed from iframe.
    window.addEventListener('message', ({ data }) => {
      if (typeof data === 'string' && data.includes('ciu_embed')) {
        const featureID = data.split(':')[1];
        const height = data.split(':')[2];
        document.querySelector(`iframe[data-feature=${featureID}]`).style.height = parseInt(height, 10) + 5 + 'px';
      }
    }, false);
  },

  /*registerActiveMenuItem: function() {
    document.querySelectorAll('.menu-item a[href]').forEach(target => {
      const isSamePath = target.pathname === location.pathname || target.pathname === location.pathname.replace('index.html', '');
      const isSubPath = !NexT.CONFIG.root.startsWith(target.pathname) && location.pathname.startsWith(target.pathname);
      target.classList.toggle('menu-item-active', target.hostname === location.hostname && (isSamePath || isSubPath));
    });
  },
	
  registerLangSelect: function() {
    const selects = document.querySelectorAll('.lang-select');
    selects.forEach(sel => {
      sel.value = NexT.CONFIG.page.lang;
      sel.addEventListener('change', () => {
        const target = sel.options[sel.selectedIndex];
        document.querySelectorAll('.lang-select-label span').forEach(span => {
          span.innerText = target.text;
        });
        // Disable Pjax to force refresh translation of menu item
        window.location.href = target.dataset.href;
      });
    });
  },*/

  registerSidebarTOC: function () {
    const toc = document.getElementById('TableOfContents');
    if (!toc.hasChildNodes()) {
      const tocActive = document.querySelector('.sidebar-inner');
      tocActive.classList.remove('sidebar-nav-active', 'sidebar-toc-active');
      tocActive.classList.add('sidebar-overview-active');
    }
    this.sections = [...document.querySelectorAll('.post-toc li a')].map(element => {
      const target = document.getElementById(decodeURI(element.getAttribute('href')).replace('#', ''));
      // TOC item animation navigate.
      element.addEventListener('click', event => {
        event.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY;
        window.anime({
          targets: document.scrollingElement,
          duration: 500,
          easing: 'linear',
          scrollTop: offset,
          complete: () => {
            history.pushState(null, document.title, element.href);
          }
        });
      });
      return target;
    });
  },

  registerPostReward: function () {
    const button = document.querySelector('.reward-container button');
    if (!button) return;
    button.addEventListener('click', () => {
      document.querySelector('.post-reward').classList.toggle('active');
    });
  },

  initCommontesDispaly: function () {
    const comms = document.querySelectorAll('.comment-wrap > div');
    if (comms.length <= 1) return;
    comms.forEach(function (item) {
      let dis = window.getComputedStyle(item, null).display;
      item.style.display = dis;
    });
  },

  registerCommonSwitch: function () {
    const button = document.querySelector('.comment-switch .switch-btn');
    if (!button) return;
    const comms = document.querySelectorAll('.comment-wrap > div');
    button.addEventListener('click', () => {
      button.classList.toggle('move');
      comms.forEach(function (item) {
        if (item.style.display === 'none') {
          item.style.cssText = "display: block; animation: tabshow .8s";
        } else {
          item.style.cssText = "display: none;"
        }
      });
    });
  },

  hideComments: function () {
    let postComments = document.querySelector('.post-comments');
    if (postComments !== null) {
        postComments.style.display = 'none';
    }
  },

  hiddeLodingCmp: function (selector) {
    const loadding = document.querySelector(selector).previousElementSibling;
    loadding.style.display = 'none';
  },

  activateNavByIndex: function (index) {
    const target = document.querySelectorAll('.post-toc li a')[index];
    if (!target || target.classList.contains('active-current')) return;

    document.querySelectorAll('.post-toc .active').forEach(element => {
      element.classList.remove('active', 'active-current');
    });
    target.classList.add('active', 'active-current');
    let parent = target.parentNode;
    while (!parent.matches('.post-toc')) {
      if (parent.matches('li')) parent.classList.add('active');
      parent = parent.parentNode;
    }
    // Scrolling to center active TOC element if TOC content is taller then viewport.
    const tocElement = document.querySelector('.sidebar-panel-container');
    if (!tocElement.parentNode.classList.contains('sidebar-toc-active')) return;
    window.anime({
      targets: tocElement,
      duration: 200,
      easing: 'linear',
      scrollTop: tocElement.scrollTop - (tocElement.offsetHeight / 2) + target.getBoundingClientRect().top - tocElement.getBoundingClientRect().top
    });
  },

  updateSidebarPosition: function () {
    if (window.innerWidth < 992 || NexT.CONFIG.scheme === 'Pisces' || NexT.CONFIG.scheme === 'Gemini') return;
    // Expand sidebar on post detail page by default, when post has a toc.
    const hasTOC = document.querySelector('.post-toc');
    let display = NexT.CONFIG.sidebar;
    if (typeof display !== 'boolean') {
      // There's no definition sidebar in the page front-matter.
      display = NexT.CONFIG.sidebar.display === 'always' || (NexT.CONFIG.sidebar.display === 'post' && hasTOC);
    }
    if (display) {
      window.dispatchEvent(new Event('sidebar:show'));
    }
  },

  activateSidebarPanel: function (index) {
    const duration = 200;
    const sidebar = document.querySelector('.sidebar-inner');
    const panel = document.querySelector('.sidebar-panel-container');
    const activeClassName = ['sidebar-toc-active', 'sidebar-overview-active'];

    if (sidebar.classList.contains(activeClassName[index])) return;

    window.anime({
      duration,
      targets: panel,
      easing: 'linear',
      opacity: 0,
      translateY: [0, -20],
      complete: () => {
        // Prevent adding TOC to Overview if Overview was selected when close & open sidebar.
        sidebar.classList.replace(activeClassName[1 - index], activeClassName[index]);
        window.anime({
          duration,
          targets: panel,
          easing: 'linear',
          opacity: [0, 1],
          translateY: [-20, 0]
        });
      }
    });
  },

  getStyle: function (src, position='after', parent) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', src);

    const head = (parent || document.head);
    if (position === 'before') {
      head.prepend(link);
    } else {
      head.append(link);
    }
  },

  getScript: function (src, options = {}, legacyCondition) {
    if (typeof options === 'function') {
      return this.getScript(src, {
        condition: legacyCondition
      }).then(options);
    }
    const {
      condition = false,
      attributes: {
        id = '',
        async = false,
        defer = false,
        crossOrigin = '',
        dataset = {},
        ...otherAttributes
      } = {},
      parentNode = null
    } = options;

    return new Promise((resolve, reject) => {
      if (condition) {
        resolve();
      } else {
        const script = document.createElement('script');

        if (id) script.id = id;
        if (crossOrigin) script.crossOrigin = crossOrigin;
        script.async = async;
        script.defer = defer;
        Object.assign(script.dataset, dataset);
        Object.entries(otherAttributes).forEach(([name, value]) => {
          script.setAttribute(name, String(value));
        });

        script.onload = resolve;
        script.onerror = reject;

        if (typeof src === 'object') {
          const { url, integrity } = src;
          script.src = url;
          if (integrity) {
            script.integrity = integrity;
            script.crossOrigin = 'anonymous';
          }
        } else {
          script.src = src;
        }
        (parentNode || document.head).appendChild(script);
      }
    });
  },

  lazyLoadComponent: function(selector, legacyCallback) {
    if (legacyCallback) {
      return this.lazyLoadComponent(selector).then(legacyCallback);
    }
    return new Promise(resolve => {
      const element = document.querySelector(selector);
      if (!element) {
        resolve();
        return;
      }
      const intersectionObserver = new IntersectionObserver((entries, observer) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        resolve();
        observer.disconnect();
      });
      intersectionObserver.observe(element);
    });
  }
};
;
/* boot starup */

(function () {
  const onPageLoaded = () => document.dispatchEvent(
    new Event('page:loaded', {
      bubbles: true
    })
  );

  if (document.readyState === 'loading') {
    document.addEventListener('readystatechange', onPageLoaded, { once: true });
  } else {
    onPageLoaded();
  }
  document.addEventListener('pjax:success', onPageLoaded);
})();

NexT.boot.registerEvents = function() {

  NexT.utils.registerImageLoadEvent();
  NexT.utils.registerScrollPercent();
  // NexT.utils.registerCanIUseTag();
  NexT.utils.registerToolButtons();
  // Register comment's components
  NexT.plugins.register();

  // Register comment counter click event
  const commentCnt = document.querySelector('#comments-count');
  if (commentCnt && NexT.CONFIG.page.isPage) {
    commentCnt.addEventListener('click',  event => {
      NexT.utils.slidScrollBarAnime('comments');
    });
  }

  // Mobile top menu bar.
  document.querySelector('.site-nav-toggle .toggle').addEventListener('click', event => {
    event.currentTarget.classList.toggle('toggle-close');
    const siteNav = document.querySelector('.site-nav');
    if (!siteNav) return;
    siteNav.style.setProperty('--scroll-height', siteNav.scrollHeight + 'px');
    document.body.classList.toggle('site-nav-on');
  });

  document.querySelectorAll('.sidebar-nav li').forEach((element, index) => {
    element.addEventListener('click', () => {
      NexT.utils.activateSidebarPanel(index);
    });
  });

  window.addEventListener('hashchange', () => {
    const tHash = location.hash;
    if (tHash !== '' && !tHash.match(/%\S{2}/)) {
      const target = document.querySelector(`.tabs ul.nav-tabs li a[href="${tHash}"]`);
      target && target.click();
    }
  });
};

NexT.boot.refresh = function() {

  NexT.utils.fmtSiteInfo();

  if (!NexT.CONFIG.page.isPage) return;
 
  NexT.utils.registerSidebarTOC();
  NexT.utils.registerCopyCode();
  NexT.utils.registerPostReward();
  if(NexT.CONFIG.page.comments) {    
    NexT.utils.initCommontesDispaly();
    NexT.utils.registerCommonSwitch();
    NexT.utils.domAddClass('#goto-comments', 'goto-comments-on');
  } else {
    NexT.utils.hideComments();
  }
  NexT.utils.registerImageViewer();

  //TODO
   /**
   * Register JS handlers by condition option.
   * Need to add config option in Front-End at 'scripts/helpers/next-config.js' file.
   */
  //NexT.CONFIG.prism && window.Prism.highlightAll();
  /*NexT.CONFIG.mediumzoom && window.mediumZoom('.post-body :not(a) > img, .post-body > img', {
    background: 'var(--content-bg-color)'
  });*/
  // NexT.CONFIG.lazyload && window.lozad('.post-body img').observe();
  // NexT.CONFIG.pangu && window.pangu.spacingPage();
  /*NexT.utils.registerTabsTag();
  NexT.utils.registerActiveMenuItem();
  NexT.utils.registerLangSelect();*/
  /*NexT.utils.wrapTableWithBox();
  NexT.utils.registerVideoIframe();*/

};

NexT.boot.motion = function() {
  // Define Motion Sequence & Bootstrap Motion.
  if (NexT.CONFIG.motion.enable) {
    NexT.motion.integrator
      .add(NexT.motion.middleWares.header)
      .add(NexT.motion.middleWares.postList)
      .add(NexT.motion.middleWares.sidebar)
      .add(NexT.motion.middleWares.footer)
      .bootstrap();
  }
  NexT.utils.updateSidebarPosition();
};

document.addEventListener('DOMContentLoaded', () => {
  NexT.boot.registerEvents();
  NexT.boot.motion();
  NexT.boot.refresh();
});

;
/* global NexT, CONFIG */

NexT.motion = {};

NexT.motion.integrator = {
  queue: [],
  init : function() {
    this.queue = [];
    return this;
  },
  add: function(fn) {
    const sequence = fn();
    if (NexT.CONFIG.motion.async) this.queue.push(sequence);
    else this.queue = this.queue.concat(sequence);
    return this;
  },
  bootstrap: function() {
    if (!NexT.CONFIG.motion.async) this.queue = [this.queue];
    this.queue.forEach(sequence => {
      const timeline = window.anime.timeline({
        duration: 200,
        easing  : 'linear'
      });
      sequence.forEach(item => {
        if (item.deltaT) timeline.add(item, item.deltaT);
        else timeline.add(item);
      });
    });
  }
};

NexT.motion.middleWares = {
  header: function() {
    const sequence = [];

    function getMistLineSettings(targets) {
      sequence.push({
        targets,
        scaleX  : [0, 1],
        duration: 500,
        deltaT  : '-=200'
      });
    }

    function pushToSequence(targets, sequenceQueue = false) {
      sequence.push({
        targets,
        opacity: 1,
        top    : 0,
        deltaT : sequenceQueue ? '-=200' : '-=0'
      });
    }

    pushToSequence('header.header');
    NexT.CONFIG.scheme === 'Mist' && getMistLineSettings('.logo-line');
    NexT.CONFIG.scheme === 'Muse' && pushToSequence('.custom-logo-image');
    pushToSequence('.site-title');
    pushToSequence('.site-brand-container .toggle', true);
    pushToSequence('.site-subtitle');
    (NexT.CONFIG.scheme === 'Pisces' || NexT.CONFIG.scheme === 'Gemini') && pushToSequence('.custom-logo-image');

    document.querySelectorAll('.menu-item').forEach(targets => {
      sequence.push({
        targets,
        complete: () => targets.classList.add('animated', 'fadeInDown'),
        deltaT  : '-=200'
      });
    });

    return sequence;
  },

  subMenu: function() {
    const subMenuItem = document.querySelectorAll('.sub-menu .menu-item');
    if (subMenuItem.length > 0) {
      subMenuItem.forEach(element => {
        element.classList.add('animated');
      });
    }
    return [];
  },

  postList: function() {
    const sequence = [];
    const { postblock, postheader, postbody, collheader } = NexT.CONFIG.motion.transition;

    function animate(animation, selector) {
      if (!animation) return;
      document.querySelectorAll(selector).forEach(targets => {
        sequence.push({
          targets,
          complete: () => targets.classList.add('animated', animation),
          deltaT  : '-=100'
        });
      });
    }

    animate(postblock, '.post-block,.flinks-block, .pagination, .post-comments');
    animate(collheader, '.collection-header');
    animate(postheader, '.post-header');
    animate(postbody, '.post-body');

    return sequence;
  },

  sidebar: function() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarTransition = NexT.CONFIG.motion.transition.sidebar;
    // Only for Pisces | Gemini.
    if (sidebarTransition && (NexT.CONFIG.scheme === 'Pisces' || NexT.CONFIG.scheme === 'Gemini')) {
      return [{
        targets : sidebar,
        complete: () => sidebar.classList.add('animated', sidebarTransition)
      }];
    }
    return [];
  },

  footer: function() {
    return [{
      targets: document.querySelector('.footer'),
      opacity: 1
    }];
  }
};

;
/* global CONFIG */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const doSaveScroll = () => {
    localStorage.setItem('bookmark' + location.pathname, window.scrollY);
  };

  const scrollToMark = () => {
    let top = localStorage.getItem('bookmark' + location.pathname);
    top = parseInt(top, 10);
    // If the page opens with a specific hash, just jump out
    if (!isNaN(top) && location.hash === '') {
      // Auto scroll to the position
      window.anime({
        targets  : document.scrollingElement,
        duration : 200,
        easing   : 'linear',
        scrollTop: top
      });
    }
  };
  // Register everything
  const init = function(trigger) {
    // Create a link element
    const link = document.querySelector('.book-mark-link');
    // Scroll event
    window.addEventListener('scroll', () => link.classList.toggle('book-mark-link-fixed', window.scrollY === 0), { passive: true });
    // Register beforeunload event when the trigger is auto
    if (trigger === 'auto') {
      // Register beforeunload event
      window.addEventListener('beforeunload', doSaveScroll);
      document.addEventListener('pjax:send', doSaveScroll);
    }
    // Save the position by clicking the icon
    link.addEventListener('click', () => {
      doSaveScroll();
      window.anime({
        targets : link,
        duration: 200,
        easing  : 'linear',
        top     : -30,
        complete: () => {
          setTimeout(() => {
            link.style.top = '';
          }, 400);
        }
      });
    });
    scrollToMark();
    document.addEventListener('pjax:success', scrollToMark);
  };

  init(NexT.CONFIG.bookmark.save);
});

;
/* AddThis share plugin */
NexT.plugins.share.addthis = function() {
  const element = '.addthis_inline_share_toolbox';
  if (!NexT.CONFIG.addthis || !NexT.utils.checkDOMExist(element)) return; 

  const addthis_js = NexT.CONFIG.addthis.js + '?pubid=' + NexT.CONFIG.addthis.cfg.pubid;

  NexT.utils.lazyLoadComponent(element, function() {
    NexT.utils.getScript(addthis_js, {
      attributes: {
        async: false
      },
      parentNode: document.querySelector(element)
    });
  });
}
;
/* Waline comment plugin */
NexT.plugins.comments.waline = function() {
  const element = '.waline-container';
  if (!NexT.CONFIG.waline
    || !NexT.utils.checkDOMExist(element)) return; 
  
  const {
    comment,
    emoji, 
    imguploader, 
    pageview, 
    placeholder, 
    sofa,
    requiredmeta, 
    serverurl, 
    wordlimit,
    reaction,
    reactiontext,
    reactiontitle
  } = NexT.CONFIG.waline.cfg;

  const waline_js = NexT.utils.getCDNResource(NexT.CONFIG.waline.js);

  let locale = {
    placeholder   : placeholder,
    sofa          : sofa,
    reactionTitle : reactiontitle
  };

  reactiontext.forEach(function(value, index){
    locale['reaction'+index] = value;
  });

  NexT.utils.lazyLoadComponent(element, function () {    
    NexT.utils.getScript(waline_js, function(){
      const waline_css = NexT.utils.getCDNResource(NexT.CONFIG.waline.css);
      NexT.utils.getStyle(waline_css, 'before');

      Waline.init({
        locale,
        el            : element,
        pageview      : pageview,
        comment       : comment,
        emoji         : emoji,
        imageUploader : imguploader,
        wordLimit     : wordlimit,
        requiredMeta  : requiredmeta,
        reaction      : reaction,
        serverURL     : serverurl,
        lang          : NexT.CONFIG.lang,
        dark          : 'html[data-theme="dark"]'
      });

      NexT.utils.hiddeLodingCmp(element);
    })
  });
}
;
/* Page's view & comment counter plugin */
NexT.plugins.others.counter = function() {
    let pageview_js = undefined;
    let comment_js = undefined;

    const post_meta = NexT.CONFIG.postmeta;

    const views = post_meta.views;
    if(views != undefined && views.enable) {
      if (views.plugin == 'waline') {
        pageview_js = NexT.utils.getCDNResource(NexT.CONFIG.page.waline.js[0]);
        NexT.utils.getScript(pageview_js, function(){
          Waline.pageviewCount({
            serverURL: NexT.CONFIG.waline.cfg.serverurl
          });
        });
      }
    }

    const comments = post_meta.comments;
    if (comments != undefined && comments.enable) {
      if (comments.plugin == 'waline') {
        comment_js = NexT.utils.getCDNResource(NexT.CONFIG.page.waline.js[1]);
        NexT.utils.getScript(comment_js, function(){
          Waline.commentCount({
            serverURL: NexT.CONFIG.waline.cfg.serverurl
          });
        });
      }
    }
}
;
/* Giscus comment plugin */
NexT.plugins.comments.giscus = function() {
  const element = '.giscus-container';
  if (!NexT.CONFIG.page.comments 
    || !NexT.CONFIG.giscus
    || !NexT.utils.checkDOMExist(element)) return;

  const { 
    category, 
    categoryid, 
    emit, 
    inputposition, 
    mapping, 
    reactions, 
    repo, 
    repoid, 
    theme } = NexT.CONFIG.giscus.cfg;


  NexT.utils.lazyLoadComponent(element, function() {
    NexT.utils.getScript(NexT.CONFIG.giscus.js, {
      attributes: {
        'async'                  : true,
        'crossorigin'            : 'anonymous',
        'data-repo'              : repo,
        'data-repo-id'           : repoid,
        'data-category'          : category,
        'data-category-id'       : categoryid,
        'data-mapping'           : mapping,
        'data-reactions-enabled' : reactions ? 1:0,
        'data-emit-metadata'     : emit ? 1:0,
        'data-input-position'    : inputposition,
        'data-theme'             : theme,
        'data-lang'              : NexT.CONFIG.lang,
        'data-loading'           : 'lazy'
      },
      parentNode: document.querySelector(element)
    });   
    
    NexT.utils.hiddeLodingCmp(element);
  });      
}
;
/* Google translate plugin */
NexT.plugins.others.translate = function() {
  const element = '#gtranslate';
  if (!NexT.utils.checkDOMExist(element)) return;
  NexT.utils.lazyLoadComponent(element, function() { 
    window.translateelement_styles='/css/google-translate.min.css'; 
    NexT.utils.getScript('/js/third-party/google-translate.min.js');
  });
}