class FeedApp {
  constructor(api, renderer) {
    this.api = api
    this.renderer = renderer
    this.currentPage = 1
    this.currentQuery = ""
    this.isLoading = false
    this.debounceTimer = null
  }

  run = async () => {
    this.setupObserver()
    this.renderer.onSearch((e) => this.handleSearch(e.target.value))
    this.renderer.onLoadMore(() => this.loadNextPage())
    await this.loadPosts()
  }

  handleSearch = (query) => {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(async () => {
      this.currentQuery = query
      this.currentPage = 1
      await this.loadPosts(false)
    }, 300)
  }

  loadPosts = async (append = true) => {
    if (this.isLoading) return

    this.isLoading = true
    this.renderer.toggleLoading(true)
    this.renderer.showError("")
    this.renderer.showEmpty(false)

    try {
      const posts = await this.api.getPosts(this.currentPage, this.currentQuery)

      if (posts.length === 0) {
        if (this.currentPage === 1) {
          this.renderer.renderPosts([])
          this.renderer.showEmpty(true)
        }
        this.renderer.setBtnState(true)
      } else {
        this.renderer.renderPosts(posts, append)
        this.renderer.setBtnState(posts.length < this.api.limit)
      }
    } catch (e) {
      this.renderer.showError("Не удалось загрузить данные")
    } finally {
      this.isLoading = false
      this.renderer.toggleLoading(false)
    }
  }

  loadNextPage = async () => {
    this.currentPage++
    await this.loadPosts(true)
  }

  setupObserver = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !this.isLoading &&
          !this.renderer.loadMoreBtn.disabled
        ) {
          this.loadNextPage()
        }
      },
      { rootMargin: "100px" },
    )

    observer.observe(this.renderer.loadMoreBtn)
  }
}
