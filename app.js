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
  const newsList = [];

  newsList.push('<ul>');
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
  newsList.push('</ul>');

  newsList.push(`
    <div>
      <a href="#/page/${
        store.currentPage > 1 ? store.currentPage - 1 : 1
      }">이전 페이지</a>
      <a href="#/page/${store.currentPage + 1}">다음 페이지</a>
    </div>
  `);

  container.innerHTML = newsList.join('');
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
