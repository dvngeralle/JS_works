class FeedRenderer {
  constructor() {
    this.feed = document.querySelector(".feed-container")
    this.loader = document.querySelector(".loader")
    this.error = document.querySelector(".error-message")
    this.empty = document.querySelector(".empty-message")
    this.loadMoreBtn = document.querySelector(".load-more-btn")
    this.searchInput = document.querySelector(".search-input")
  }

  renderPosts = (posts, append = false) => {
    const html = posts
      .map(
        (post) => `
            <article class="post-card">
                <h2>${post.title}</h2>
                <p>${post.body}</p>
            </article>
        `,
      )
      .join("")

    if (append) {
      this.feed.insertAdjacentHTML("beforeend", html)
    } else {
      this.feed.innerHTML = html
    }
  }

  toggleLoading = (isLoading) => {
    this.loader.style.display = isLoading ? "block" : "none"
    this.loadMoreBtn.style.display = isLoading ? "none" : "block"
  }

  showError = (message) => {
    this.error.textContent = message
    this.error.style.display = message ? "block" : "none"
  }

  showEmpty = (isEmpty) => {
    this.empty.style.display = isEmpty ? "block" : "none"
  }

  setBtnState = (isLastPage) => {
    this.loadMoreBtn.disabled = isLastPage
    this.loadMoreBtn.textContent = isLastPage
      ? "Больше нет постов"
      : "Загрузить еще"
  }

  onSearch = (fn) => {
    this.searchInput.addEventListener("input", fn)
  }

  onLoadMore = (fn) => {
    this.loadMoreBtn.addEventListener("click", fn)
  }
}
