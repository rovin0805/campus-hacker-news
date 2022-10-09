interface StoreType {
  currentPage: number;
  pageSize: number;
  feeds: FeedType[];
}

interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface FeedType extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean;
}

interface FeedDetailType extends News {
  readonly comments: CommentType[];
}

interface CommentType extends News {
  readonly level: number;
  readonly comments: CommentType[];
}

const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const BASE_URL = 'https://api.hnpwa.com/v0';
const NEWS_URL = `${BASE_URL}/news/1.json`;
const CONTENT_URL = `${BASE_URL}/item/@id.json`;

const store: StoreType = {
  currentPage: 1,
  pageSize: 10,
  feeds: [],
};

function getData<T>(url: string): T {
  ajax.open('GET', url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}

function makeFeeds(feeds: FeedType[]) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
}

function updateView(html: string) {
  if (container) {
    container.innerHTML = html;
  } else {
    console.error('There is no root container.');
  }
}

function getNewsFeed() {
  let newsFeed = store.feeds;
  const maxPage = Math.ceil(newsFeed.length / store.pageSize);
  const newsList = [];
  const newsFeedMarkup = '{{__news_feed__}}';
  const prevPageMarkup = '{{__prev_page__}}';
  const nextPageMarkup = '{{__next_page__}}';

  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${prevPageMarkup}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/${nextPageMarkup}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        ${newsFeedMarkup}        
      </div>
    </div>
  `;

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData<FeedType[]>(NEWS_URL));
  }

  for (
    let i = (store.currentPage - 1) * store.pageSize;
    i < store.currentPage * store.pageSize;
    i++
  ) {
    newsList.push(`
      <div class="${
        newsFeed[i].read ? 'bg-green-100' : 'bg-white'
      } p-6 mt-6 rounded-lg shadow-md transition-colors duration-500  hover:bg-green-300">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
              newsFeed[i].comments_count
            }</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
  }

  template = template.replace(newsFeedMarkup, newsList.join(''));
  template = template.replace(
    prevPageMarkup,
    String(store.currentPage > 1 ? store.currentPage - 1 : 1)
  );
  template = template.replace(
    nextPageMarkup,
    String(
      store.currentPage === maxPage ? store.currentPage : store.currentPage + 1
    )
  );

  updateView(template);
}

function getFeedDetail() {
  const id = location.hash.substring(7);
  const newsContent = getData<FeedDetailType>(CONTENT_URL.replace(`@id`, id));
  const commentsMarkup = '{{__comments__}}';

  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>
        ${commentsMarkup}
      </div>
    </div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  updateView(
    template.replace(commentsMarkup, makeComments(newsContent.comments))
  );
}

function makeComments(comments: CommentType[]): string {
  const commentsString = [];

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];

    commentsString.push(`
    <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
      <div class="text-gray-400">
        <i class="fa fa-sort-up mr-2"></i>
        <strong>${comment.user}</strong> ${comment.time_ago}
      </div>
      <p class="text-gray-700">${comment.content}</p>
    </div>      
  `);

    // 대댓글
    if (comment.comments.length > 0) {
      commentsString.push(makeComments(comment.comments));
    }
  }

  return commentsString.join('');
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
