const BASE_URL = 'https://api.hnpwa.com/v0';
const NEWS_URL = `${BASE_URL}/news/1.json`;
const CONTENT_URL = `${BASE_URL}/item/@id.json`;
const ajax = new XMLHttpRequest();
const container = document.getElementById('root');
const store = {
  currentPage: 1,
  pageSize: 10,
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}

function getNewsFeed() {
  const newsFeed = getData(NEWS_URL);
  const maxPage = Math.ceil(newsFeed.length / store.pageSize);
  const newsList = [];
  const newsFeedMarkup = '{{__news_feed__}}';
  const prevPageMarkup = '{{__prev_page__}}';
  const nextPageMarkup = '{{__next_page__}}';

  let template = `
    <div>
      <h1>Hacker News</h1>
      <ul>
        ${newsFeedMarkup}
      </ul>
      <div>
        <a href="#/page/${prevPageMarkup}">이전 페이지</a>
        <a href="#/page/${nextPageMarkup}">다음 페이지</a>
      </div>
    </div>
  `;

  for (
    let i = (store.currentPage - 1) * store.pageSize;
    i < store.currentPage * store.pageSize;
    i++
  ) {
    newsList.push(`
      <li>
        <a href="#/feed/${newsFeed[i].id}">
          ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
  }

  template = template.replace(newsFeedMarkup, newsList.join(''));
  template = template.replace(
    prevPageMarkup,
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace(
    nextPageMarkup,
    store.currentPage === maxPage ? store.currentPage : store.currentPage + 1
  );

  container.innerHTML = template;
}

function getFeedDetail() {
  const id = location.hash.substring(7);
  const newsContent = getData(CONTENT_URL.replace(`@id`, id));

  container.innerHTML = `
    <h1>${newsContent.title}</h1>
    <div>
      <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
  `;
}

function router() {
  const routePath = location.hash;
  if (routePath === '') {
    getNewsFeed();
  } else if (routePath.includes('page')) {
    store.currentPage = Number(routePath.substring(7));
    getNewsFeed();
  } else {
    getFeedDetail();
  }
}

window.addEventListener('hashchange', router);

router();
